#!/usr/bin/env python3
"""PostToolUse (Edit|Write|MultiEdit) : tsc incrémental + eslint, limités au fichier touché.

Sortie limitée à 20 lignes ; `decision: block` renvoie les erreurs à Claude pour correction.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

MAX_LINES = 20


def run(cmd: list[str], cwd: Path, timeout: int = 90) -> str:
    try:
        proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return (proc.stdout or "") + (proc.stderr or "")
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return ""


def main() -> int:
    data = common.read_hook_input()
    file_path = (data.get("tool_input") or {}).get("file_path", "")
    root = Path(data.get("cwd") or common.project_dir()).resolve()
    path = Path(file_path)
    if path.suffix not in (".ts", ".tsx") or not (root / "tsconfig.json").exists():
        return 0
    try:
        rel = path.resolve().relative_to(root).as_posix()
    except ValueError:
        return 0
    if rel.startswith(("core/", "node_modules/", "supabase/functions/")):
        return 0
    (root / ".daroms").mkdir(exist_ok=True)
    tsc = run(["bunx", "tsc", "--noEmit", "--incremental", "--tsBuildInfoFile", ".daroms/tsbuildinfo", "--pretty", "false"], root)
    errors = [line for line in tsc.splitlines() if line.startswith(rel) and "error TS" in line]
    lint = run(["bunx", "eslint", "--format", "unix", rel], root, timeout=60)
    errors += [line.replace(str(root) + "/", "") for line in lint.splitlines() if ":" in line and "[Error" in line]
    if not errors:
        return 0
    shown = errors[:MAX_LINES]
    more = f"\n(+{len(errors) - MAX_LINES} autres)" if len(errors) > MAX_LINES else ""
    reason = f"daroms-typecheck : {len(errors)} problème(s) dans {rel}\n" + "\n".join(shown) + more
    print(json.dumps({"decision": "block", "reason": reason}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
