#!/usr/bin/env python3
"""Parcours /daroms-pilot : validation manuelle de chaque étape (app.steps.json).

prompt (UserPromptSubmit) : enregistre /daroms-valider et /daroms-corriger tapés par l'utilisateur.
  Seul un message humain passe par ce hook : l'agent ne peut pas valider à sa place.
gate (PreToolUse Skill|Edit|Write|MultiEdit|Bash) : refuse à l'agent les skills d'une étape tant que les
  précédentes ne sont pas validées, et toute écriture directe de app.steps.json.
Sans app.steps.json (parcours non commencé), le hook ne fait rien.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import daroms_common as common  # noqa: E402

STATE_FILE = "app.steps.json"
CLOSED = ("done", "skipped")
LABELS = {"todo": "à faire", "doing": "en cours", "review": "à valider", "changes": "à corriger", "done": "validée", "skipped": "sautée"}
USER_ONLY = ("daroms-valider", "daroms-corriger")


def load_defs(project: Path) -> dict:
    for path in (common.core_dir(project) / "_ai" / "context" / "daroms-steps.json", project / ".claude" / "context" / "daroms-steps.json"):
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return {"steps": [], "free": []}


def load_state(project: Path) -> dict | None:
    path = project / STATE_FILE
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def save_state(project: Path, state: dict) -> None:
    (project / STATE_FILE).write_text(json.dumps(state, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def status_of(state: dict, step_id: str) -> str:
    return state.get("steps", {}).get(step_id, {}).get("status", "todo")


def current_index(defs: dict, state: dict) -> int | None:
    """Première étape ni validée ni sautée (None : parcours terminé)."""
    for i, step in enumerate(defs["steps"]):
        if status_of(state, step["id"]) not in CLOSED:
            return i
    return None


def describe(defs: dict, index: int | None) -> str:
    if index is None:
        return "parcours terminé"
    step = defs["steps"][index]
    skills = ", ".join(f"/{s}" for s in step["skills"]) or "pas de skill dédié (voir /daroms-pilot)"
    return f"étape {index + 1} « {step['title']} » ({skills})"


def record(state: dict, step_id: str, status: str, note: str = "") -> None:
    entry = state.setdefault("steps", {}).setdefault(step_id, {})
    entry["status"] = status
    entry.setdefault("history", []).append({"status": status, "at": now(), "by": "utilisateur", **({"note": note} if note else {})})
    if note:
        entry["note"] = note


def on_prompt(prompt: str, defs: dict, state: dict | None) -> tuple[dict | None, str]:
    """Message de l'utilisateur -> (nouvel état ou None si inchangé, contexte pour l'agent)."""
    match = re.match(r"^\s*/(daroms-valider|daroms-corriger)\b(.*)$", prompt or "", re.S)
    if not match:
        return None, ""
    command, rest = match.group(1), match.group(2).strip()
    if state is None:
        return None, "daroms-steps : aucun parcours en cours (`bun daroms steps start`, ou /daroms-pilot)."
    index = current_index(defs, state)
    if index is None:
        return None, "daroms-steps : le parcours est terminé, rien à valider."
    step = defs["steps"][index]
    if command == "daroms-corriger":
        if not rest:
            return None, f"daroms-steps : /daroms-corriger sans consigne ; demander à l'utilisateur ce qu'il faut corriger à l'{describe(defs, index)}."
        record(state, step["id"], "changes", rest)
        return state, f"daroms-steps : l'utilisateur demande des corrections à l'{describe(defs, index)} : « {rest} ». Les appliquer, puis représenter la fin d'étape et s'arrêter."
    skip = re.match(r"^passer\s*:?\s*(.*)$", rest, re.I | re.S)
    if skip:
        record(state, step["id"], "skipped", skip.group(1).strip() or "sans raison donnée")
        verb = "sautée"
    elif step.get("observe") and not rest:
        return None, (
            f"daroms-steps : validation non enregistrée, la réponse manque. Demander à l'utilisateur de taper "
            f"/daroms-valider <réponse> à la question : « {step['observe']} »."
        )
    else:
        record(state, step["id"], "done", rest)
        verb = "validée"
    following = current_index(defs, state)
    return state, f"daroms-steps : {describe(defs, index)} {verb} par l'utilisateur. Suite : {describe(defs, following)}."


def skill_step(defs: dict, skill: str) -> int | None:
    for i, step in enumerate(defs["steps"]):
        if skill in step["skills"]:
            return i
    return None


def gate(tool: str, tool_input: dict, defs: dict, state: dict | None) -> str | None:
    """Raison du refus, ou None si l'appel est permis."""
    if state is None:
        return None
    if tool in ("Edit", "Write", "MultiEdit") and Path(tool_input.get("file_path", "")).name == STATE_FILE:
        return f"daroms-steps : {STATE_FILE} n'est écrit que par les validations de l'utilisateur ; utiliser `bun daroms steps ready <n> \"<résumé>\"`."
    if tool == "Bash":
        command = tool_input.get("command", "")
        if STATE_FILE in command or re.search(r"\bsteps\s+validate\b", command):
            return f"daroms-steps : seul l'utilisateur valide une étape (/daroms-valider) ; lire l'état avec `bun daroms steps`."
        return None
    if tool != "Skill":
        return None
    skill = str(tool_input.get("skill", "")).split(":")[-1].lstrip("/")
    if skill in USER_ONLY:
        return f"daroms-steps : /{skill} est réservé à l'utilisateur."
    target = skill_step(defs, skill)
    current = current_index(defs, state)
    if target is None or current is None or target <= current:
        return None
    return (
        f"daroms-steps : /{skill} appartient à l'{describe(defs, target)}, mais l'{describe(defs, current)} attend la validation "
        "de l'utilisateur. Présenter le résumé et la liste « À vérifier » (`bun daroms steps ready`), puis s'arrêter : "
        "l'utilisateur tape /daroms-valider ou /daroms-corriger."
    )


def mark_doing(defs: dict, state: dict, tool: str, tool_input: dict) -> bool:
    """Un skill de l'étape en cours démarre : à faire -> en cours."""
    if tool != "Skill":
        return False
    current = current_index(defs, state)
    skill = str(tool_input.get("skill", "")).split(":")[-1].lstrip("/")
    if current is None or skill_step(defs, skill) != current:
        return False
    step_id = defs["steps"][current]["id"]
    if status_of(state, step_id) != "todo":
        return False
    state.setdefault("steps", {}).setdefault(step_id, {})["status"] = "doing"
    return True


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    data = common.read_hook_input()
    project = common.project_dir()
    try:
        defs = load_defs(project)
    except FileNotFoundError:
        return 0
    state = load_state(project)
    if mode == "prompt":
        updated, message = on_prompt(data.get("prompt", ""), defs, state)
        if updated is not None:
            save_state(project, updated)
        if message:
            print(message)
        return 0
    if mode == "gate":
        tool, tool_input = data.get("tool_name", ""), data.get("tool_input") or {}
        reason = gate(tool, tool_input, defs, state)
        if reason:
            print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": reason}}, ensure_ascii=False))
        elif state is not None and mark_doing(defs, state, tool, tool_input):
            save_state(project, state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
