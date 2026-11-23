#!/usr/bin/env python3
"""PreToolUse (Bash) : l'agent ne pousse jamais sur main (ni master).

Le code arrive sur main par une PR relue par un humain. Refuse :
- git push avec une destination main/master (main, HEAD:main, +main, refs/heads/main, :main) ;
- git push sans destination quand la branche courante est main/master (git push, git push origin,
  git push -u origin HEAD, --follow-tags) ;
- git push --all, --mirror.
Reste permis : pousser une autre branche, pousser seulement des tags (git push origin v1.2.0, --tags).
Le dépôt visé suit `git -C <dossier>` et `cd <dossier>`. Une session de maintenance peut lever le verrou :
lancer Claude Code avec DAROMS_ALLOW_MAIN_PUSH=1. Protection côté serveur : règle de branche sur GitHub.
"""
from __future__ import annotations

import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

PROTECTED = ("main", "master")
ALLOW = "DAROMS_ALLOW_MAIN_PUSH"
SEGMENT = re.compile(r"&&|\|\||;|\||\n")
# options de git push qui prennent une valeur séparée
VALUED = {"--repo", "--receive-pack", "--exec", "-o", "--push-option", "--signed"}

REASON = (
    "daroms-push-guard : pousser sur {branch} est réservé à l'humain, après relecture d'une PR. "
    "Pousser une branche de travail (git push -u origin <branche>) puis ouvrir une PR."
)


def current_branch(repo: Path) -> str:
    """Branche courante, y compris avant le premier commit (symbolic-ref) ; vide en HEAD détachée."""
    try:
        out = subprocess.run(["git", "-C", str(repo), "symbolic-ref", "--short", "-q", "HEAD"], capture_output=True, text=True, timeout=5)
        return out.stdout.strip() if out.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def protected_ref(refspec: str, branch_of_head: str) -> str | None:
    """Branche protégée visée par une refspec (main, HEAD:main, +main, refs/heads/main, :main), sinon None."""
    spec = refspec.lstrip("+")
    dest = spec.split(":", 1)[1] if ":" in spec else spec
    if dest == "HEAD":
        dest = branch_of_head
    dest = dest.removeprefix("refs/heads/")
    return dest if dest in PROTECTED else None


def push_violation(command: str, cwd: Path, branch=current_branch) -> str | None:
    """Branche protégée que la commande pousserait, sinon None."""
    here = cwd
    for segment in SEGMENT.split(command):
        try:
            words = shlex.split(segment.strip())
        except ValueError:
            words = segment.split()
        while words and (re.match(r"^\w+=", words[0]) or words[0] in ("sudo", "command", "env", "time")):
            words = words[1:]
        if not words:
            continue
        if words[0] == "cd":
            here = Path(os.path.normpath(here / os.path.expanduser(words[1] if len(words) > 1 else "~")))
            continue
        if os.path.basename(words[0]) != "git":
            continue
        repo, rest = here, words[1:]
        while rest and rest[0].startswith("-"):
            flag = rest.pop(0)
            if flag == "-C" and rest:
                repo = Path(os.path.normpath(here / rest.pop(0)))
            elif flag in ("-c", "--git-dir", "--work-tree") and rest:
                rest.pop(0)
        if not rest or rest[0] != "push":
            continue
        args = rest[1:]
        if "--all" in args or "--mirror" in args:
            return "toutes les branches (--all ou --mirror)"
        tags_only = "--tags" in args
        positional: list[str] = []
        skip = False
        for a in args:
            if skip:
                skip = False
                continue
            if a in VALUED:
                skip = True
            elif not a.startswith("-"):
                positional.append(a)
        head = branch(repo)
        refspecs = positional[1:]
        for spec in refspecs:
            hit = protected_ref(spec, head)
            if hit:
                return hit
        if not refspecs and not tags_only and head in PROTECTED:
            return head
    return None


def main() -> int:
    if os.environ.get(ALLOW) == "1":
        return 0
    data = common.read_hook_input()
    command = (data.get("tool_input") or {}).get("command", "")
    if "push" not in command:
        return 0
    cwd = Path(data.get("cwd") or common.project_dir())
    hit = push_violation(command, cwd)
    if not hit:
        return 0
    output = {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": REASON.format(branch=hit)}
    print(json.dumps({"hookSpecificOutput": output}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
