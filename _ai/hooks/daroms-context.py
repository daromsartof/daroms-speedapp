#!/usr/bin/env python3
"""Routeur de zones : indique à Claude où regarder, sans qu'il explore.

  build          (SessionStart)     indexe les zones : features de l'app, modules actifs,
                                    zones apprises (daroms-zones.json, app-zones.json)
  route          (UserPromptSubmit) ancres de la demande -> zone ; silencieux si incertain
  test "demande"                    affiche le routage (vérification manuelle)
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

CACHE = "daroms-index.cache.json"


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.lower())
    return "".join(c for c in text if not unicodedata.combining(c))


def tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", norm(text))


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default


def flat_locale(tree: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for key, value in tree.items():
        if isinstance(value, dict):
            out.update(flat_locale(value, f"{prefix}{key}."))
        elif isinstance(value, str):
            out[f"{prefix}{key}"] = value
    return out


def camel(slug: str) -> str:
    head, *rest = slug.split("-")
    return head + "".join(part.title() for part in rest)


def feature_zones(root: Path) -> list[dict]:
    locales = {}
    for file in (root / "locales").glob("*.json"):
        locales.update({f"{file.stem}:{k}": v for k, v in flat_locale(load_json(file, {})).items()})
    routes = {}
    for route in (root / "app").rglob("*.tsx") if (root / "app").is_dir() else []:
        match = re.search(r"@/features/([a-z0-9-]+)/", route.read_text(encoding="utf-8"))
        if match:
            routes.setdefault(match.group(1), []).append(route.relative_to(root).as_posix())
    zones = []
    features = root / "src" / "features"
    for folder in sorted(p for p in features.iterdir() if p.is_dir()) if features.is_dir() else []:
        slug = folder.name
        titles = [v for k, v in locales.items() if k.split(":", 1)[1].startswith(f"{camel(slug)}.title")]
        zones.append({
            "name": slug,
            "keywords": sorted({slug, *slug.split("-"), *[t for title in titles for t in tokens(title)]}),
            "paths": [f"src/features/{slug}/"] + routes.get(slug, []),
            "files": sorted(p.name for p in folder.iterdir() if p.is_file())[:8],
        })
    return zones


def active_modules(root: Path) -> set[str]:
    registry = root / "src" / "generated" / "modules.ts"
    text = registry.read_text(encoding="utf-8") if registry.exists() else ""
    return set(re.findall(r"@daroms/module-([a-z0-9-]+)", text))


def build(root: Path) -> dict:
    core = common.core_dir(root)
    ai = core / "_ai" / "context"
    modules = active_modules(root)
    learned = load_json(ai / "daroms-zones.json", {"zones": []})["zones"]
    learned = [z for z in learned if not z.get("module") or z["module"] in modules]
    app_zones = load_json(root / ".claude" / "context" / "app-zones.json", {"zones": []})["zones"]
    index = {
        "zones": feature_zones(root) + app_zones + learned,
        "aliases": load_json(ai / "daroms-alias.json", {}),
    }
    target = root / ".claude" / "context" / CACHE
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    return index


def route(prompt: str, index: dict) -> list[str]:
    words = set(tokens(prompt))
    for word in list(words):
        words.update(norm(a) for a in index.get("aliases", {}).get(word, []))
    text = " ".join(tokens(prompt))
    scored = []
    for zone in index["zones"]:
        score = 0
        for keyword in zone.get("keywords", []):
            kw = norm(keyword)
            if " " in kw:
                score += 2 if kw in text else 0
            elif kw in words:
                score += 2
        score += sum(5 for p in zone.get("paths", []) if p.rstrip("/") in prompt)
        if score:
            scored.append((score, zone))
    scored.sort(key=lambda item: -item[0])
    if not scored or scored[0][0] < 2 or (len(scored) > 1 and scored[1][0] == scored[0][0]):
        return []
    zone = scored[0][1]
    lines = [f"daroms-context : zone probable « {zone['name']} »"]
    for path in zone.get("paths", [])[:4]:
        lines.append(f"- {path}")
    if zone.get("files"):
        lines.append(f"- fichiers : {', '.join(zone['files'])}")
    if zone.get("notes"):
        lines.append(f"- note : {zone['notes']}")
    return lines


def load_index(root: Path) -> dict:
    cached = load_json(root / ".claude" / "context" / CACHE, None)
    return cached if cached else build(root)


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "route"
    root = common.project_dir()
    try:
        common.core_dir(root)
    except FileNotFoundError:
        return 0
    if mode == "build":
        build(root)
        return 0
    if mode == "test":
        lines = route(" ".join(sys.argv[2:]), build(root))
        print("\n".join(lines) if lines else "(silencieux : zone incertaine)")
        return 0
    prompt = common.read_hook_input().get("prompt", "")
    if prompt.strip().startswith("/") and not prompt.strip().startswith("/daroms-screen"):
        return 0
    lines = route(prompt, load_index(root))
    if lines:
        print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
