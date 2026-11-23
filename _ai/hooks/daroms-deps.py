#!/usr/bin/env python3
"""PreToolUse (Bash) : un paquet ajouté doit exister sur npm et avoir un historique.

Les modèles proposent des paquets qui n'existent pas (au moins 5,2 % pour les modèles commerciaux,
Spracklen et al., USENIX Security 2025) ; un attaquant peut publier ce nom. Couvre `bun add`,
`bun install <paquet>`, `npm install|i|add`, `pnpm add`, `yarn add`, `expo install` (bunx, npx).

- paquet absent du registre : refus ;
- paquet de moins de 500 téléchargements par semaine (nom squatté récent, faute de frappe) : l'utilisateur confirme ;
- paquet déjà dans package.json, chemin local, URL git ou workspace : non vérifié ;
- registre injoignable : laisse passer (travail hors ligne), avec un avertissement à l'agent.
"""
from __future__ import annotations

import json
import re
import shlex
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

REGISTRY = "https://registry.npmjs.org/"
DOWNLOADS = "https://api.npmjs.org/downloads/point/last-week/"
MIN_WEEKLY = 500
TIMEOUT = 4
NAME = re.compile(r"^(?:@[a-z0-9][\w.-]*/)?[a-z0-9][\w.-]*$", re.I)
# sous-commandes qui ajoutent des paquets nommés
ADDERS = {("bun", "add"), ("bun", "a"), ("bun", "install"), ("bun", "i"), ("npm", "install"), ("npm", "i"), ("npm", "add"), ("pnpm", "add"), ("yarn", "add")}


def package_name(spec: str) -> str | None:
    """Nom npm d'un argument (`zod@3`, `@scope/x@^1`) ; None pour un chemin, une URL, un alias."""
    if spec.startswith((".", "/", "~", "file:", "link:", "workspace:", "git", "http:", "https:", "npm:")) or "://" in spec:
        return None
    if spec.startswith("@"):
        scope, _, rest = spec.partition("/")
        name = f"{scope}/{rest.split('@', 1)[0]}"
    else:
        name = spec.split("@", 1)[0]
    return name if NAME.match(name) else None


def packages_in(command: str) -> list[str]:
    """Paquets nommés que la commande ajoute (toutes les commandes chaînées par && ; |)."""
    found: list[str] = []
    for part in re.split(r"&&|\|\||;|\|", command):
        try:
            words = shlex.split(part)
        except ValueError:
            continue
        while words and ("=" in words[0] and not words[0].startswith("-")):
            words = words[1:]  # VAR=valeur en tête
        if len(words) < 2:
            continue
        args: list[str] = []
        head = words[0].rsplit("/", 1)[-1]
        if (head, words[1]) in ADDERS:
            args = words[2:]
        elif head in ("bunx", "npx") and words[1:3] == ["expo", "install"]:
            args = words[3:]
        elif head == "expo" and words[1] == "install":
            args = words[2:]
        for arg in args:
            if arg == "--":
                continue
            if arg.startswith("-"):
                continue
            name = package_name(arg)
            if name and name not in found:
                found.append(name)
    return found


def declared(root: Path) -> set[str]:
    try:
        manifest = json.loads((root / "package.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return set()
    names: set[str] = set()
    for key in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        names.update((manifest.get(key) or {}).keys())
    return names


def verdict(name: str, meta: dict | None, weekly: int | None) -> tuple[str, str] | None:
    """('deny' | 'ask', raison) ou None si le paquet paraît sain. meta None = absent du registre."""
    if meta is None:
        return "deny", f"{name} n'existe pas sur npm : nom probablement inventé. Chercher le vrai paquet (documentation officielle) avant d'installer."
    if weekly is not None and weekly < MIN_WEEKLY:
        return "ask", f"{name} n'a que {weekly} téléchargements par semaine : vérifier qu'il s'agit du bon paquet (nom proche d'un paquet connu ?)."
    return None


def fetch_json(url: str) -> dict | None:
    request = urllib.request.Request(url, headers={"accept": "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8", "user-agent": "daroms-deps"})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


def lookup(name: str) -> tuple[dict | None, int | None]:
    """Fiche abrégée du registre et téléchargements hebdomadaires ; OSError si le registre est injoignable."""
    quoted = urllib.parse.quote(name, safe="@")
    try:
        meta = fetch_json(REGISTRY + quoted.replace("/", "%2F"))
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None, None
        raise OSError(str(error)) from error
    try:
        weekly = (fetch_json(DOWNLOADS + quoted) or {}).get("downloads")
    except (OSError, ValueError):
        weekly = None
    return meta, weekly


def decide(command: str, root: Path, look=lookup) -> tuple[str, str] | None:
    names = [n for n in packages_in(command) if n not in declared(root)]
    if not names:
        return None
    asks: list[str] = []
    offline: list[str] = []
    for name in names:
        try:
            meta, weekly = look(name)
        except OSError:
            offline.append(name)
            continue
        result = verdict(name, meta, weekly)
        if result and result[0] == "deny":
            return result
        if result:
            asks.append(result[1])
    if asks:
        return "ask", " ".join(asks)
    if offline:
        return "allow", f"registre npm injoignable : {', '.join(offline)} non vérifié(s) ; s'assurer que le nom vient de la documentation officielle."
    return None


def main() -> int:
    data = common.read_hook_input()
    command = (data.get("tool_input") or {}).get("command", "")
    if not command:
        return 0
    root = Path(data.get("cwd") or common.project_dir()).resolve()
    result = decide(command, root)
    if not result:
        return 0
    decision, reason = result
    output: dict = {"hookEventName": "PreToolUse", "permissionDecision": decision, "permissionDecisionReason": f"daroms-deps : {reason}"}
    if decision == "allow":
        output = {"hookEventName": "PreToolUse", "additionalContext": f"daroms-deps : {reason}"}
    print(json.dumps({"hookSpecificOutput": output}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
