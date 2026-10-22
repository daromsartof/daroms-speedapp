#!/usr/bin/env python3
"""SessionStart : synchronise core/_ai vers .claude/ de l'app.

- copie règles, règles à la demande, skills, agents, hooks, contexte (fichiers daroms-* uniquement)
- supprime les daroms-* disparus du cœur, ne touche jamais aux app-*
- fusionne core/_ai/settings.json dans .claude/settings.json (hooks daroms remplacés, permissions unies)
- régénère CATALOG.md et digest.md si leurs sources ont changé
Silencieux quand tout est à jour (la sortie d'un hook SessionStart entre dans le contexte).

Options : --force (recopie tout), --generate-only (catalogue + digest seulement).
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

FOLDERS = ("rules", "rules-ondemand", "agents", "hooks", "context", "skills")
STAMP = ".daroms-sync"


def is_core_entry(name: str) -> bool:
    return name.startswith("daroms") or name in ("vendor",)


def sync_folder(src: Path, dst: Path) -> int:
    """Copie les entrées daroms-* (fichiers ou dossiers) et retire celles disparues."""
    if not src.is_dir():
        return 0
    dst.mkdir(parents=True, exist_ok=True)
    changed = 0
    wanted = set()
    for entry in src.iterdir():
        if not is_core_entry(entry.name) or entry.name in ("__pycache__", "tests"):
            continue
        if entry.name == "vendor" and entry.is_dir():
            # skills tiers figés : copiés à plat sous leur propre nom
            for skill in entry.iterdir():
                if skill.is_dir():
                    wanted.add(skill.name)
                    changed += copy_entry(skill, dst / skill.name)
            continue
        wanted.add(entry.name)
        changed += copy_entry(entry, dst / entry.name)
    vendor_names = {p.name for p in (src / "vendor").iterdir() if p.is_dir()} if (src / "vendor").is_dir() else set()
    for existing in dst.iterdir():
        managed = existing.name.startswith("daroms") or existing.name in vendor_names
        if managed and existing.name not in wanted:
            shutil.rmtree(existing) if existing.is_dir() else existing.unlink()
            changed += 1
    return changed


def copy_entry(src: Path, dst: Path) -> int:
    if src.is_dir():
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst, ignore=shutil.ignore_patterns("__pycache__", "tests"))
        return 1
    if dst.exists() and dst.read_bytes() == src.read_bytes():
        return 0
    shutil.copy2(src, dst)
    return 1


def merge_settings(core_settings: Path, app_settings: Path) -> bool:
    if not core_settings.exists():
        return False
    core = json.loads(core_settings.read_text(encoding="utf-8"))
    app = json.loads(app_settings.read_text(encoding="utf-8")) if app_settings.exists() else {}
    merged = dict(app)
    hooks = {event: [h for h in entries if "daroms-" not in json.dumps(h)] for event, entries in app.get("hooks", {}).items()}
    for event, entries in core.get("hooks", {}).items():
        hooks[event] = entries + hooks.get(event, [])
    merged["hooks"] = {k: v for k, v in hooks.items() if v}
    permissions = dict(app.get("permissions", {}))
    for key, values in core.get("permissions", {}).items():
        if isinstance(values, list):
            permissions[key] = sorted(set(permissions.get(key, [])) | set(values))
        else:
            permissions.setdefault(key, values)
    merged["permissions"] = permissions
    for key, value in core.items():
        if key not in ("hooks", "permissions"):
            merged.setdefault(key, value)
    content = json.dumps(merged, indent=2, ensure_ascii=False) + "\n"
    return common.write_if_changed(app_settings, content)


def fingerprint(core: Path) -> str:
    ai = core / "_ai"
    version = (core / "VERSION").read_text(encoding="utf-8").strip() if (core / "VERSION").exists() else "0"
    files = [p for p in ai.rglob("*") if p.is_file() and "__pycache__" not in p.parts]
    return f"{version}:{len(files)}:{common.newest_mtime(files):.0f}"


def main() -> int:
    force = "--force" in sys.argv
    project = common.project_dir()
    try:
        core = common.core_dir(project)
    except FileNotFoundError:
        return 0
    generated = common.ensure_catalog(core, force) | common.ensure_digest(core / "_ai", force)
    if "--generate-only" in sys.argv or common.is_core_repo(project):
        return 0
    claude = project / ".claude"
    stamp = claude / STAMP
    current = fingerprint(core)
    if not force and not generated and stamp.exists() and stamp.read_text(encoding="utf-8") == current:
        return 0
    changed = sum(sync_folder(core / "_ai" / folder, claude / folder) for folder in FOLDERS)
    changed += int(merge_settings(core / "_ai" / "settings.json", claude / "settings.json"))
    stamp.parent.mkdir(parents=True, exist_ok=True)
    stamp.write_text(current, encoding="utf-8")
    if changed and not force:
        print(f"daroms : couche IA synchronisée ({changed} élément(s) mis à jour depuis core/_ai).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
