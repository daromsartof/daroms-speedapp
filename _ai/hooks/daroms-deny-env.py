#!/usr/bin/env python3
"""PreToolUse (Bash) : refuse toute commande qui lit, affiche ou copie un fichier .env.

Les permissions `deny` de settings.json couvrent Read/Edit ; ce hook couvre le shell.
`.env.example` reste autorisé.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

ENV_FILE = re.compile(r"(?:^|[\s/'\"=<>|;&(])\.env(?:\.(?!example\b)[\w.-]+)?(?=$|[\s'\";|&)<>])")
ENV_DUMP = re.compile(r"(?:^|[;&|]\s*)(?:printenv|env)\s*(?:$|[;&|])")


def is_blocked(command: str) -> bool:
    return bool(ENV_FILE.search(command) or ENV_DUMP.search(command))


def main() -> int:
    data = common.read_hook_input()
    command = (data.get("tool_input") or {}).get("command", "")
    if not command or not is_blocked(command):
        return 0
    reason = "daroms-deny-env : les fichiers .env (secrets) ne se lisent pas. Utiliser .env.example pour la liste des variables."
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": reason}}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
