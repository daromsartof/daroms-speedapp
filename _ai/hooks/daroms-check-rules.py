#!/usr/bin/env python3
"""PreToolUse (Edit|Write|MultiEdit) : refuse une écriture qui viole les règles daroms.

Vérifie le texte proposé (nouveau contenu) : couleur hex/rgb, StyleSheet.create, `any`,
Supabase hors api.ts, texte en dur dans le JSX, emoji, tiret long, nombre magique de style,
style inline, route non mince, fichier > 200 lignes. Message court et précis.
Mode `--all` (daroms doctor) : analyse src/, app/ et locales/ ; code de sortie 1 si violation.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

MAX_LINES = 200
STYLE_PROPS = (
    r"p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|rowGap|columnGap|rounded|w|h|minW|maxW|minH|maxH|"
    r"width|height|top|left|right|bottom|fontSize|lineHeight|borderRadius|padding\w*|margin\w*"
)
EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF]")
RULES: list[tuple[re.Pattern[str], str, tuple[str, ...]]] = [
    (re.compile(r"""['"`]#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})['"`]"""), "couleur hex : utiliser un token (bg=\"card\", color=\"color-11\", brand-500)", (".ts", ".tsx")),
    (re.compile(r"""['"`](?:rgb|rgba|hsl|hsla)\("""), "couleur rgb/hsl : utiliser un token de thème", (".ts", ".tsx")),
    (re.compile(r"StyleSheet\.create"), "StyleSheet.create interdit : props Tamagui et tokens", (".ts", ".tsx")),
    (re.compile(r"(?::\s*any\b|\bas\s+any\b|<any>|any\[\])"), "`any` interdit : typer précisément (unknown + zod si besoin)", (".ts", ".tsx")),
    (re.compile(rf"\b(?:{STYLE_PROPS})=\{{\s*[1-9]\d*(?:\.\d+)?\s*\}}"), "nombre magique de style : token (p=\"4\", gap=\"stack\", rounded=\"card\")", (".tsx",)),
    (re.compile(r"\bstyle=\{\{"), "style inline interdit : props Tamagui avec tokens", (".tsx",)),
    (re.compile(r">\s*[A-Za-zÀ-ÿ][^<>{}\n]*[A-Za-zÀ-ÿ.!?:]\s*</[A-Za-z]"), "texte en dur dans le JSX : t('cle') + clés FR/EN dans locales/", (".tsx",)),
    (re.compile("\u2014"), "tiret long interdit dans les textes", (".ts", ".tsx", ".json")),
]
SUPABASE_IMPORT = re.compile(r"from\s+['\"]@supabase/|import\s*\{[^}]*\b(?:db|getSupabase)\b[^}]*\}\s*from\s+['\"]@daroms/data['\"]")
UI_LIBS = re.compile(r"from\s+['\"](?:react-native-paper|native-base|@rneui/|@expo/vector-icons|react-native-vector-icons|lucide-react-native|@tamagui/lucide-icons)")
REEXPORT = re.compile(r"^export\s*(?:\{[^}]*\}|\*)\s*from\s*['\"][^'\"]+['\"];?$")
SKIP = ("src/generated/", "src/types/db.ts", "src/icons/lucide/", "supabase/functions/")


def relative(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


def applies(rel: str) -> bool:
    if any(rel.startswith(s) for s in SKIP) or ".test." in rel or rel.endswith(".d.ts"):
        return False
    return rel.startswith(("src/", "app/", "locales/"))


def check(rel: str, text: str, full: str | None = None) -> list[str]:
    """Violations (au plus 8) pour le texte proposé ; `full` = contenu complet résultant."""
    suffix = Path(rel).suffix
    problems: list[str] = []
    for number, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if stripped.startswith(("//", "*", "/*")) or "daroms-ignore" in line:
            continue
        for pattern, message, suffixes in RULES:
            if suffix in suffixes and pattern.search(line):
                problems.append(f"ligne {number} : {message}")
        if EMOJI.search(line):
            problems.append(f"ligne {number} : emoji interdit")
        if suffix in (".ts", ".tsx"):
            if SUPABASE_IMPORT.search(line) and not rel.endswith("/api.ts"):
                problems.append(f"ligne {number} : Supabase uniquement dans src/features/<x>/api.ts")
            if UI_LIBS.search(line):
                problems.append(f"ligne {number} : librairie UI/icônes tierce : @daroms/ui et @daroms/ui/icons")
    content = full if full is not None else text
    if rel.startswith("app/") and suffix == ".tsx":
        body = [l for l in content.splitlines() if l.strip() and not l.strip().startswith("//")]
        if any(not REEXPORT.match(l.strip()) for l in body):
            problems.append("route non mince : app/** ne contient que `export { default } from '@/features/x/XScreen'`")
    if suffix in (".ts", ".tsx") and len(content.splitlines()) > MAX_LINES:
        problems.append(f"fichier de {len(content.splitlines())} lignes (> {MAX_LINES}) : découper (components/, hooks.ts)")
    return list(dict.fromkeys(problems))[:8]


def proposed(tool: str, tool_input: dict, path: Path) -> tuple[str, str | None]:
    """Texte à vérifier et contenu complet résultant (si calculable)."""
    if tool == "Write":
        content = tool_input.get("content", "")
        return content, content
    current = path.read_text(encoding="utf-8") if path.exists() else ""
    edits = tool_input.get("edits") or [tool_input]
    new_parts, full = [], current
    for edit in edits:
        old, new = edit.get("old_string", ""), edit.get("new_string", "")
        new_parts.append(new)
        full = full.replace(old, new) if edit.get("replace_all") else full.replace(old, new, 1)
    return "\n".join(new_parts), full


def run_hook() -> int:
    data = common.read_hook_input()
    tool_input = data.get("tool_input") or {}
    file_path = tool_input.get("file_path")
    if not file_path:
        return 0
    root = Path(data.get("cwd") or common.project_dir()).resolve()
    path = Path(file_path)
    rel = relative(path, root)
    if not applies(rel):
        return 0
    text, full = proposed(data.get("tool_name", ""), tool_input, path)
    problems = check(rel, text, full)
    if not problems:
        return 0
    reason = f"daroms-check-rules refuse {rel} :\n- " + "\n- ".join(problems) + "\nCorriger puis réécrire (voir CATALOG.md pour les tokens)."
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": reason}}, ensure_ascii=False))
    return 0


def run_all() -> int:
    root = common.project_dir()
    count = 0
    for folder in ("src", "app", "locales"):
        for path in sorted((root / folder).rglob("*")):
            if path.suffix not in (".ts", ".tsx", ".json") or "node_modules" in path.parts:
                continue
            rel = relative(path, root)
            if not applies(rel):
                continue
            for problem in check(rel, path.read_text(encoding="utf-8")):
                print(f"{rel} : {problem}")
                count += 1
    return 1 if count else 0


if __name__ == "__main__":
    sys.exit(run_all() if "--all" in sys.argv else run_hook())
