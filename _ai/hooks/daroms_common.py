"""Fonctions partagées des hooks daroms (aucune dépendance hors bibliothèque standard).

- localisation du projet et du cœur (app avec core/ en sous-module, ou dépôt cœur)
- génération de CATALOG.md (composants @daroms/ui) et de digest.md (une ligne par règle)
- écriture idempotente des fichiers générés
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

GENERATED_HEADER = "<!-- généré par daroms : ne pas modifier à la main -->"


def project_dir() -> Path:
    env = os.environ.get("CLAUDE_PROJECT_DIR")
    return Path(env).resolve() if env else Path.cwd().resolve()


def core_dir(project: Path | None = None) -> Path:
    """Dossier du cœur : `core/` dans une app, la racine dans le dépôt cœur."""
    root = project or project_dir()
    if (root / "core" / "_ai").is_dir():
        return root / "core"
    if (root / "_ai").is_dir() and (root / "packages" / "ui").is_dir():
        return root
    raise FileNotFoundError(f"cœur daroms introuvable depuis {root}")


def is_core_repo(project: Path | None = None) -> bool:
    root = project or project_dir()
    return core_dir(root) == root


def read_hook_input() -> dict:
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except (json.JSONDecodeError, OSError):
        return {}


def write_if_changed(path: Path, content: str) -> bool:
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True


def newest_mtime(paths: list[Path]) -> float:
    return max((p.stat().st_mtime for p in paths if p.exists()), default=0.0)


# --------------------------------------------------------------------------- catalogue

CATALOG_BLOCK = re.compile(r"/\*\*(.*?)\*/", re.S)


def _clean(line: str) -> str:
    return re.sub(r"^\s*\*\s?", "", line).strip()


def parse_catalog_blocks(source: str) -> list[dict]:
    entries = []
    for block in CATALOG_BLOCK.findall(source):
        if "@catalog" not in block:
            continue
        entry = {"name": "", "props": "", "example": ""}
        for line in map(_clean, block.splitlines()):
            for tag in ("catalog", "props", "example"):
                if line.startswith(f"@{tag}"):
                    entry["name" if tag == "catalog" else tag] = line[len(tag) + 1 :].strip()
        if entry["name"]:
            entries.append(entry)
    return entries


TOKENS_HELP = """## Tokens et thèmes (valeurs plates Tamagui v3, sans `$`)

- Espaces : `gutter` (marge écran), `section`, `stack`, `inline`, `tight` + échelle 4 pt `0`..`96` (`4` = 16 px), demi-pas `0-5`, `1-5`.
- Rayons : `button`, `input`, `card`, `sheet`, `chip`, `badge`, `avatar`, `pill`.
- Couleurs de thème : `background`, `background-hover`, `background-press`, `color` (texte), `color-1`..`color-11` (1 = proche du fond),
  `border-color`, `placeholder-color`, `card`, `separator`, `overlay`, `skeleton` ; absolues : `brand-50`..`brand-950`, `accent-*`, `surface-*`, Tailwind (`emerald-500`...).
- Sous-thèmes (`theme="..."`) : `brand` (plein), `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`, `level2`..`level4`, `inverse`.
- Conditions dans la valeur : `bg="card press:background-press dark:surface-900"`, `opacity="1 enter:0 exit:0"`.
- Texte : `size="1"`..`"10"` (11 à 40 px) ; icônes : `size="5"` (échelle de police) et `color="color-9"`.
- Animations : `transition="fast" | "medium" | "slow" | "bouncy"` (ressorts réglés par le ton de marque).
"""


def build_catalog(core: Path) -> str:
    components = sorted((core / "packages" / "ui" / "src" / "components").glob("*.tsx"))
    rows = []
    for file in components:
        for entry in parse_catalog_blocks(file.read_text(encoding="utf-8")):
            props = entry["props"].replace("|", "\\|")
            example = entry["example"].replace("|", "\\|")
            rows.append(f"| {entry['name']} | {props} | `{example}` |")
    icons_dir = core / "packages" / "ui" / "src" / "icons" / "lucide"
    icons = sorted(p.stem for p in icons_dir.glob("*.tsx"))
    lines = [
        GENERATED_HEADER,
        "# Catalogue @daroms/ui",
        "",
        "Lire ce fichier, jamais les sources. Import : `import { Button, Screen } from '@daroms/ui'`.",
        "Primitives de mise en page : `XStack`, `YStack`, `ScrollView`, `Separator`, `Spacer`, `Theme` (aussi exportées).",
        "",
        "| Composant | Props clés | Exemple |",
        "|---|---|---|",
        *rows,
        "",
        TOKENS_HELP,
        f"## Icônes Lucide ({len(icons)}) : `import {{ Plus }} from '@daroms/ui/icons'`",
        "",
        "Autre icône : `bun daroms icons add NomLucide` (jamais d'autre jeu).",
        "",
        ", ".join(icons),
        "",
    ]
    return "\n".join(lines)


def ensure_catalog(core: Path, force: bool = False) -> bool:
    target = core / "packages" / "ui" / "CATALOG.md"
    sources = list((core / "packages" / "ui" / "src" / "components").glob("*.tsx"))
    sources += list((core / "packages" / "ui" / "src" / "icons" / "lucide").glob("*.tsx"))
    if not force and target.exists() and target.stat().st_mtime >= newest_mtime(sources):
        return False
    return write_if_changed(target, build_catalog(core))


# --------------------------------------------------------------------------- digest des règles

FRONTMATTER = re.compile(r"^---\n(.*?)\n---\n", re.S)


def rule_description(text: str) -> str:
    """Première ligne `> ...` après le titre, sinon le titre."""
    body = FRONTMATTER.sub("", text, count=1)
    title = ""
    for line in body.splitlines():
        if line.startswith("# ") and not title:
            title = line[2:].strip()
        elif line.startswith("> "):
            return line[2:].strip()
    return title


def build_digest(ai: Path) -> str:
    lines = [
        GENERATED_HEADER,
        "# Digest des règles daroms (une ligne par règle)",
        "",
        "Règles détaillées chargées automatiquement selon les fichiers touchés (`.claude/rules/`).",
        "Règles à la demande : lire `.claude/rules-ondemand/<nom>.md` quand le sujet arrive.",
        "",
    ]
    for folder, label in (("rules", ""), ("rules-ondemand", " (à la demande)")):
        for file in sorted((ai / folder).glob("daroms-*.md")):
            lines.append(f"- **{file.stem}**{label} : {rule_description(file.read_text(encoding='utf-8'))}")
    lines.append("")
    return "\n".join(lines)


def ensure_digest(ai: Path, force: bool = False) -> bool:
    target = ai / "digest.md"
    sources = list((ai / "rules").glob("*.md")) + list((ai / "rules-ondemand").glob("*.md"))
    if not force and target.exists() and target.stat().st_mtime >= newest_mtime(sources):
        return False
    return write_if_changed(target, build_digest(ai))
