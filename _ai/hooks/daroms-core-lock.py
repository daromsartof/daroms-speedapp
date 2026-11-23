#!/usr/bin/env python3
"""PreToolUse (Edit|Write|MultiEdit|NotebookEdit|Bash) : core/ est en lecture seule dans une app.

core/ est le sous-module du framework, versionné à part : un fichier modifié là crée une divergence locale
non versionnée, perdue ou en conflit à la prochaine mise à jour du cœur. Ce hook refuse :
- Edit, Write, MultiEdit, NotebookEdit d'un fichier sous core/ (y compris par un lien symbolique, mode --link) ;
- en shell : redirection vers core/, sed -i / perl -i, cp/mv/rm/touch/tee... vers core/, git qui crée un état
  local dans core/ (commit, add, reset, stash, merge, pull, push...), toute écriture après `cd core`.

Reste permis : lire core/, et le mettre sur une version publiée (git -C core fetch / checkout <tag>,
git submodule update). Dans le dépôt du cœur lui-même, le hook ne fait rien.
Maintenance du cœur depuis une app : lancer Claude Code avec DAROMS_CORE_UNLOCK=1 (la variable de la
commande n'y suffit pas : le hook lit celle de la session).
"""
from __future__ import annotations

import json
import os
import re
import shlex
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

UNLOCK = "DAROMS_CORE_UNLOCK"
WRITE_TOOLS = {"Edit", "Write", "MultiEdit", "NotebookEdit"}
# commandes qui écrivent dans tous leurs arguments chemins
WRITERS = {"rm", "rmdir", "touch", "mkdir", "truncate", "tee", "chmod", "chown", "patch", "unlink", "shred"}
# commandes qui écrivent seulement dans leur destination (dernier argument) ; mv retire aussi la source
DEST_WRITERS = {"cp", "install", "rsync", "ln", "scp"}
IN_PLACE = {"sed", "perl", "ruby"}
# git qui crée un état local (commit, index, branche, fusion) : ce qui diverge du cœur publié
GIT_MUTATING = {"commit", "add", "rm", "mv", "reset", "stash", "apply", "am", "cherry-pick", "merge", "rebase", "revert", "pull", "push", "tag", "commit-tree", "update-ref", "update-index", "notes"}
SEGMENT = re.compile(r"&&|\|\||;|\||\n")
REDIRECT = re.compile(r"(?:\d?>>?|&>>?|>\|)\s*(['\"]?)([^\s'\";|&]+)\1")
INTERPRETER_WRITE = re.compile(r"\b(?:open\([^)]*['\"][wa]|write_text|write_bytes|writeFileSync|writeFile|appendFile|Bun\.write|unlinkSync|rmSync)\b")

REASON = (
    "daroms-core-lock : core/ est le sous-module du framework, versionné à part ; le modifier ici crée une divergence "
    "locale non versionnée. Faire le changement dans l'app (src/, fichiers app-* de .claude/), ou dans le dépôt du cœur "
    "(session dédiée, puis nouvelle version). Lire core/ reste permis ; mise à jour : git -C core fetch --tags && "
    "git -C core checkout <tag>. Maintenance du cœur depuis cette app : relancer Claude Code avec DAROMS_CORE_UNLOCK=1."
)


def core_paths(project: Path) -> list[Path]:
    """Chemins de core/ dans l'app (tel quel et résolu, pour le mode --link) ; vide dans le dépôt du cœur."""
    core = project / "core"
    if not (core / "_ai").exists() or common.is_core_repo(project):
        return []
    return list(dict.fromkeys([core.absolute(), core.resolve()]))


def inside(raw: str, cwd: Path, cores: list[Path]) -> bool:
    """Le chemin (relatif à cwd, ~ et $VAR développés) est-il sous core/ ?"""
    token = os.path.expandvars(os.path.expanduser(raw.strip("'\"")))
    if not token or token.startswith("-"):
        return False
    path = Path(os.path.normpath(cwd / token))
    candidates = {path}
    try:
        candidates.add(path.resolve())
    except OSError:
        pass
    return any(c == core or core in c.parents for c in candidates for core in cores)


def words_of(segment: str) -> list[str]:
    try:
        words = shlex.split(segment, comments=False)
    except ValueError:
        words = segment.split()
    while words and (re.match(r"^\w+=", words[0]) or words[0] in ("sudo", "command", "env", "time", "nohup")):
        words = words[1:]
    return words


def bash_violation(command: str, cwd: Path, cores: list[Path]) -> str | None:
    """Raison du refus si la commande écrit dans core/, sinon None."""
    here = cwd
    for segment in SEGMENT.split(command):
        segment = segment.strip()
        if not segment:
            continue
        words = words_of(segment)
        in_core = any(here == c or c in here.parents for c in cores)
        # redirections (même en tête : > core/x)
        for _, target in REDIRECT.findall(segment):
            if target != "/dev/null" and (inside(target, here, cores) or (in_core and not target.startswith("/"))):
                return f"redirection vers {target}"
        if not words:
            continue
        cmd = os.path.basename(words[0])
        args = words[1:]
        paths = [a for a in args if not a.startswith("-")]
        if cmd == "cd":
            target = args[0] if args else os.path.expanduser("~")
            here = Path(os.path.normpath(here / os.path.expandvars(os.path.expanduser(target))))
            continue
        if cmd == "git":
            repo, rest = here, list(args)
            while rest and rest[0].startswith("-"):
                flag = rest.pop(0)
                if flag == "-C" and rest:
                    repo = Path(os.path.normpath(here / rest.pop(0)))
                elif flag in ("-c", "--git-dir", "--work-tree") and rest:
                    rest.pop(0)
            sub = rest[0] if rest else ""
            if any(repo == c or c in repo.parents for c in cores) and sub in GIT_MUTATING:
                return f"git {sub} dans core/"
            continue
        if cmd in IN_PLACE and any(a.startswith("-i") or a == "--in-place" for a in args):
            if in_core or any(inside(p, here, cores) for p in paths):
                return f"{cmd} -i sur core/"
            continue
        if cmd == "mv" and paths and (in_core or any(inside(p, here, cores) for p in paths)):
            return "mv dans core/"
        if cmd in WRITERS and paths and (in_core or any(inside(p, here, cores) for p in paths)):
            return f"{cmd} dans core/"
        if cmd in DEST_WRITERS and paths and (inside(paths[-1], here, cores) or (in_core and not paths[-1].startswith("/"))):
            return f"{cmd} vers core/"
        if cmd == "dd" and any(a.startswith("of=") and inside(a[3:], here, cores) for a in args):
            return "dd vers core/"
        if cmd in ("python", "python3", "node", "bun", "deno") and any(a in ("-c", "-e", "--eval") for a in args):
            if INTERPRETER_WRITE.search(segment) and ("core/" in segment or in_core):
                return f"{cmd} qui écrit dans core/"
    return None


def decide(data: dict, project: Path, env: dict | None = None) -> str | None:
    """Raison du refus, ou None."""
    if (env if env is not None else os.environ).get(UNLOCK) == "1":
        return None
    cores = core_paths(project)
    if not cores:
        return None
    tool = data.get("tool_name", "")
    tool_input = data.get("tool_input") or {}
    cwd = Path(data.get("cwd") or project)
    if tool in WRITE_TOOLS:
        target = tool_input.get("file_path") or tool_input.get("notebook_path") or ""
        return f"écriture de {target}" if target and inside(target, cwd, cores) else None
    if tool == "Bash":
        return bash_violation(tool_input.get("command", ""), cwd, cores)
    return None


def main() -> int:
    data = common.read_hook_input()
    project = Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or common.project_dir()).resolve()
    # le projet est le dossier qui contient core/ (cwd peut être un sous-dossier de l'app)
    for candidate in [project, *project.parents]:
        if (candidate / "core" / "_ai").exists() or (candidate / "app.manifest.ts").exists():
            project = candidate
            break
    what = decide(data, project)
    if not what:
        return 0
    output = {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": f"{REASON} (refusé : {what})"}
    print(json.dumps({"hookSpecificOutput": output}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
