"""Tests des hooks daroms : python3 -m unittest discover -s _ai/hooks/tests"""
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

HOOKS = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HOOKS))


def load(name: str):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), HOOKS / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


rules = load("daroms-check-rules")
env = load("daroms-deny-env")
context = load("daroms-context")
sync = load("daroms-sync")
stats = load("daroms-session-stats")
deps = load("daroms-deps")
core_lock = load("daroms-core-lock")
push_guard = load("daroms-push-guard")
import daroms_common as common  # noqa: E402


class CheckRules(unittest.TestCase):
    def test_violations(self):
        text = "import { db } from '@daroms/data'\nconst x: any = 1\n<YStack p={12} bg=\"#fff\" style={{ flex: 1 }}>\n<Body>Bonjour</Body>"
        problems = " ".join(rules.check("src/features/x/components/X.tsx", text))
        for expected in ("Supabase", "`any`", "couleur hex", "nombre magique", "style inline", "texte en dur"):
            self.assertIn(expected, problems)

    def test_clean_code_passes(self):
        text = "const t = useT()\n<YStack p=\"gutter\" bg=\"card\">\n<Body>{t('home.title')}</Body>\n</YStack>"
        self.assertEqual(rules.check("src/features/home/HomeScreen.tsx", text), [])

    def test_api_may_use_supabase(self):
        self.assertEqual(rules.check("src/features/todos/api.ts", "import { db } from '@daroms/data'"), [])
        self.assertEqual(rules.check("src/features/todos/api.ts", "import { localTable, queryKeys } from '@daroms/data'"), [])

    def test_local_table_only_in_api(self):
        problems = rules.check("src/features/todos/TodosScreen.tsx", "import { localTable } from '@daroms/data'")
        self.assertIn("localTable", " ".join(problems))

    def test_thin_route(self):
        self.assertEqual(rules.check("app/x.tsx", "export { default } from '@/features/x/XScreen'\n"), [])
        self.assertTrue(rules.check("app/x.tsx", "export default function X() { return null }\n"))

    def test_skip_generated(self):
        self.assertFalse(rules.applies("src/generated/modules.ts"))
        self.assertFalse(rules.applies("core/packages/ui/src/x.tsx"))

    def test_locales(self):
        self.assertTrue(rules.check("locales/fr.json", '{ "a": "Super \U0001F680" }'))
        self.assertTrue(rules.check("locales/fr.json", '{ "a": "un — deux" }'))

    def test_edit_computes_full_content(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp) / "a.ts"
            file.write_text("const a = 1\n")
            text, full = rules.proposed("Edit", {"old_string": "1", "new_string": "2"}, file)
            self.assertEqual((text, full), ("2", "const a = 2\n"))


class Pressables(unittest.TestCase):
    def test_custom_pressable_needs_a_label(self):
        text = "<YStack\n  p=\"4\"\n  onPress={() => open(x > 1)}\n>\n  <Heart />\n</YStack>"
        problems = rules.check("src/features/x/components/Like.tsx", text)
        self.assertIn("ligne 1 : <YStack onPress> sans aria-label", " ".join(problems))

    def test_labelled_or_catalog_components_pass(self):
        self.assertEqual(rules.unlabelled_pressables("<Pressable aria-label={t('like')} onPress={like}>"), [])
        self.assertEqual(rules.unlabelled_pressables("<Button onPress={save}>{t('save')}</Button>"), [])
        self.assertEqual(rules.unlabelled_pressables("<YStack p=\"4\" gap=\"stack\">"), [])


class Deps(unittest.TestCase):
    def test_finds_added_packages(self):
        self.assertEqual(deps.packages_in("bun add zod@3 @tanstack/react-query -d"), ["zod", "@tanstack/react-query"])
        self.assertEqual(deps.packages_in("cd app && bunx expo install expo-haptics; npm i ./local lodash"), ["expo-haptics", "lodash"])
        self.assertEqual(deps.packages_in("CI=1 pnpm add left-pad"), ["left-pad"])
        self.assertEqual(deps.packages_in("bun install"), [])
        self.assertEqual(deps.packages_in("git commit -m 'bun add zod'"), [])
        self.assertIsNone(deps.package_name("github:user/repo"))

    def test_verdicts(self):
        self.assertEqual(deps.verdict("x", None, None)[0], "deny")
        self.assertEqual(deps.verdict("x", {"name": "x"}, 12)[0], "ask")
        self.assertIsNone(deps.verdict("x", {"name": "x"}, 90000))

    def test_decide_skips_declared_and_tolerates_offline(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "package.json").write_text(json.dumps({"dependencies": {"zod": "^3"}}))
            calls = []

            def fake(name):
                calls.append(name)
                if name == "offline-pkg":
                    raise OSError("timeout")
                return (None, None) if name == "fake-pkg" else ({"name": name}, 10000)

            self.assertIsNone(deps.decide("bun add zod", root, fake))
            self.assertEqual(calls, [])
            self.assertEqual(deps.decide("bun add react fake-pkg", root, fake)[0], "deny")
            self.assertEqual(deps.decide("bun add offline-pkg", root, fake)[0], "allow")


class CoreLock(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.app = Path(self.tmp.name) / "app"
        (self.app / "core" / "_ai").mkdir(parents=True)
        (self.app / "core" / "packages" / "ui").mkdir(parents=True)
        (self.app / "src").mkdir()

    def tearDown(self):
        self.tmp.cleanup()

    def bash(self, command, cwd=None):
        return core_lock.decide({"tool_name": "Bash", "tool_input": {"command": command}, "cwd": str(cwd or self.app)}, self.app, env={})

    def test_write_tools_refused_inside_core_only(self):
        edit = lambda path: core_lock.decide({"tool_name": "Edit", "tool_input": {"file_path": path}, "cwd": str(self.app)}, self.app, env={})
        self.assertIsNotNone(edit(str(self.app / "core" / "packages" / "ui" / "x.tsx")))
        self.assertIsNotNone(edit("core/_ai/rules/x.md"))
        self.assertIsNone(edit(str(self.app / "src" / "x.tsx")))
        self.assertIsNone(edit(str(self.app / "core-notes.md")))

    def test_shell_writes_into_core_are_refused(self):
        for command in [
            "echo x > core/packages/ui/a.ts",
            "sed -i 's/a/b/' core/cli/daroms.ts",
            "cp src/x.ts core/packages/ui/x.ts",
            "rm -rf core/modules/auth",
            "mv core/a.ts src/a.ts",
            "git -C core commit -am wip",
            "cd core && git stash",
            "cd core && echo x >> README.md",
            "cat src/a.ts | tee core/a.ts",
            "python3 -c \"open('core/x','w').write('y')\"",
        ]:
            self.assertIsNotNone(self.bash(command), command)

    def test_reads_and_versioned_updates_stay_allowed(self):
        for command in [
            "cat core/packages/ui/CATALOG.md",
            "grep -rn Button core/packages/ui/src",
            "cp core/template/brand.ts src/brand.example.ts",
            "git -C core status",
            "git -C core fetch --tags && git -C core checkout v0.10.0",
            "git submodule update --init core",
            "cd core && git log --oneline -3",
            "bun daroms doctor > /dev/null",
            "echo ok > src/notes.txt",
        ]:
            self.assertIsNone(self.bash(command), command)

    def test_unlock_and_core_repo(self):
        data = {"tool_name": "Bash", "tool_input": {"command": "echo x > core/a.ts"}, "cwd": str(self.app)}
        self.assertIsNone(core_lock.decide(data, self.app, env={"DAROMS_CORE_UNLOCK": "1"}))
        repo = Path(self.tmp.name) / "core-repo"
        (repo / "_ai").mkdir(parents=True)
        (repo / "packages" / "ui").mkdir(parents=True)
        self.assertIsNone(core_lock.decide({"tool_name": "Write", "tool_input": {"file_path": str(repo / "_ai" / "x.md")}, "cwd": str(repo)}, repo, env={}))


class PushGuard(unittest.TestCase):
    def check(self, command, head="feature/x"):
        return push_guard.push_violation(command, Path("/repo"), branch=lambda _repo: head)

    def test_refuses_main_explicit_or_implicit(self):
        self.assertEqual(self.check("git push origin main"), "main")
        self.assertEqual(self.check("git push origin HEAD:refs/heads/main"), "main")
        self.assertEqual(self.check("git push -f origin +master"), "master")
        self.assertEqual(self.check("git push origin :main"), "main")
        self.assertEqual(self.check("git push", head="main"), "main")
        self.assertEqual(self.check("git push -u origin HEAD", head="main"), "main")
        self.assertEqual(self.check("git push --follow-tags", head="main"), "main")
        self.assertIsNotNone(self.check("git push --all origin"))
        self.assertEqual(self.check("cd core && git push origin main"), "main")

    def test_allows_feature_branches_and_tags(self):
        self.assertIsNone(self.check("git push -u origin claude/nifty"))
        self.assertIsNone(self.check("git push"))
        self.assertIsNone(self.check("git push origin main:feature/copy"))
        self.assertIsNone(self.check("git push origin v1.2.0", head="main"))
        self.assertIsNone(self.check("git push origin --tags", head="main"))
        self.assertIsNone(self.check('git commit -m "push main"', head="main"))

    def test_reads_current_branch_of_real_repo(self):
        with tempfile.TemporaryDirectory() as tmp:
            import subprocess
            subprocess.run(["git", "init", "-q", "-b", "main", tmp], check=True)
            self.assertEqual(push_guard.current_branch(Path(tmp)), "main")
            self.assertEqual(push_guard.push_violation("git push", Path(tmp)), "main")


class DenyEnv(unittest.TestCase):
    def test_blocks_env(self):
        for cmd in ("cat .env", "grep KEY .env.local", "source ./.env", "cp .env /tmp/x", "printenv"):
            self.assertTrue(env.is_blocked(cmd), cmd)

    def test_allows_example(self):
        for cmd in ("cat .env.example", "bun daroms dev", "ls -la", "echo environment"):
            self.assertFalse(env.is_blocked(cmd), cmd)


class Context(unittest.TestCase):
    INDEX = {
        "zones": [
            {"name": "profile", "keywords": ["profile", "profil"], "paths": ["src/features/profile/"]},
            {"name": "todos", "keywords": ["todos", "taches"], "paths": ["src/features/todos/"]},
            {"name": "marque", "keywords": ["brand", "couleur"], "paths": ["brand.ts"]},
        ],
        "aliases": {"profil": ["profile"], "tache": ["todos"]},
    }

    def test_routes_with_alias_and_accents(self):
        self.assertIn("profile", context.route("écran profil", self.INDEX)[0])
        self.assertIn("todos", context.route("Ajoute une tâche", self.INDEX)[0])

    def test_silent_when_uncertain(self):
        self.assertEqual(context.route("bonjour", self.INDEX), [])


class Sync(unittest.TestCase):
    def test_merge_keeps_app_entries(self):
        with tempfile.TemporaryDirectory() as tmp:
            core, app = Path(tmp) / "core.json", Path(tmp) / "app.json"
            core.write_text(json.dumps({"hooks": {"Stop": [{"hooks": [{"command": "daroms-x"}]}]}, "permissions": {"deny": ["Read(./.env)"]}}))
            app.write_text(json.dumps({"hooks": {"Stop": [{"hooks": [{"command": "app-y"}]}, {"hooks": [{"command": "daroms-old"}]}]}, "permissions": {"deny": ["Read(./secret)"]}, "model": "x"}))
            sync.merge_settings(core, app)
            merged = json.loads(app.read_text())
            commands = [h["hooks"][0]["command"] for h in merged["hooks"]["Stop"]]
            self.assertEqual(commands, ["daroms-x", "app-y"])
            self.assertEqual(merged["permissions"]["deny"], ["Read(./.env)", "Read(./secret)"])
            self.assertEqual(merged["model"], "x")

    def test_merge_adds_new_object_entries(self):
        with tempfile.TemporaryDirectory() as tmp:
            core, app = Path(tmp) / "core.json", Path(tmp) / "app.json"
            core.write_text(json.dumps({"skillOverrides": {"a": "name-only", "b": "name-only"}}))
            app.write_text(json.dumps({"skillOverrides": {"a": "on", "c": "off"}}))
            sync.merge_settings(core, app)
            merged = json.loads(app.read_text())
            self.assertEqual(merged["skillOverrides"], {"a": "on", "b": "name-only", "c": "off"})


class Vendor(unittest.TestCase):
    AI = HOOKS.parent

    def test_vendor_skills_are_licensed_and_name_only(self):
        overrides = json.loads((self.AI / "settings.json").read_text(encoding="utf-8"))["skillOverrides"]
        skills = [p for p in (self.AI / "skills" / "vendor").iterdir() if p.is_dir()]
        self.assertTrue(skills)
        for skill in skills:
            self.assertTrue(any(f.name.startswith("LICENSE") for f in skill.iterdir()), skill.name)
            self.assertIn(f"\nname: {skill.name}\n", (skill / "SKILL.md").read_text(encoding="utf-8"), skill.name)
            self.assertEqual(overrides.get(skill.name), "name-only", skill.name)
            self.assertFalse((self.AI / "skills" / skill.name).exists(), f"{skill.name} masque un skill du cœur")

    def test_forked_skills_stand_alone(self):
        forked = 0
        for path in sorted((self.AI / "skills").glob("daroms-*/SKILL.md")):
            text = path.read_text(encoding="utf-8")
            head = text.split("\n---\n", 1)[0]
            if "\ncontext: fork" not in head:
                continue
            forked += 1
            self.assertIn("\nbackground: false", head, path.parent.name)
            self.assertRegex(head, r"\nmodel: (sonnet|haiku)\b", path.parent.name)
            self.assertNotIn("AskUserQuestion", text, f"{path.parent.name} : pas de question dans un sous-agent")
        self.assertGreater(forked, 0)


class Stats(unittest.TestCase):
    def test_context_warning_steps(self):
        first = 150_000
        self.assertEqual(stats.context_warning(100_000, 0, first), (None, 0))
        message, warned = stats.context_warning(162_000, 0, first)
        self.assertIn("162 k", message)
        self.assertEqual(warned, 150_000)
        self.assertEqual(stats.context_warning(170_000, 150_000, first), (None, 150_000))
        self.assertEqual(stats.context_warning(215_000, 150_000, first)[1], 210_000)
        self.assertEqual(stats.context_warning(90_000, 210_000, first), (None, 0))
        self.assertEqual(stats.context_warning(500_000, 0, 0), (None, 0))

    def test_summarize_reads_last_main_context(self):
        lines = [
            {"type": "assistant", "message": {"id": "a", "usage": {"input_tokens": 10, "cache_read_input_tokens": 1000, "cache_creation_input_tokens": 90}}},
            {"type": "assistant", "isSidechain": True, "message": {"id": "b", "usage": {"input_tokens": 5, "cache_read_input_tokens": 9000}}},
        ]
        with tempfile.TemporaryDirectory() as tmp:
            transcript = Path(tmp) / "t.jsonl"
            transcript.write_text("\n".join(json.dumps(l) for l in lines))
            self.assertEqual(stats.summarize(transcript)["context"], 1100)


class Common(unittest.TestCase):
    def test_catalog_block(self):
        source = "/**\n * @catalog Button\n * @props variant\n * @example <Button />\n */"
        self.assertEqual(common.parse_catalog_blocks(source), [{"name": "Button", "props": "variant", "example": "<Button />"}])

    def test_rule_description(self):
        self.assertEqual(common.rule_description("---\npaths: x\n---\n# Titre\n\n> Résumé court.\n"), "Résumé court.")


if __name__ == "__main__":
    unittest.main()


steps = load("daroms-steps")
STEP_DEFS = json.loads((HOOKS.parent / "context" / "daroms-steps.json").read_text(encoding="utf-8"))


class Steps(unittest.TestCase):
    def state(self, **statuses):
        return {"version": 1, "started": "2026-01-01", "steps": {k: {"status": v} for k, v in statuses.items()}}

    def test_without_journey_nothing_happens(self):
        self.assertIsNone(steps.gate("Skill", {"skill": "daroms-publish"}, STEP_DEFS, None))
        updated, message = steps.on_prompt("/daroms-valider", STEP_DEFS, None)
        self.assertIsNone(updated)
        self.assertIn("aucun parcours", message)

    def test_user_validation_moves_to_next_step(self):
        updated, message = steps.on_prompt("/daroms-valider  tout est bon", STEP_DEFS, self.state(cadrage="review"))
        self.assertEqual(updated["steps"]["cadrage"]["status"], "done")
        self.assertEqual(updated["steps"]["cadrage"]["history"][-1]["by"], "utilisateur")
        self.assertIn("Conception", message)

    def test_validation_needs_an_observed_answer(self):
        updated, message = steps.on_prompt("/daroms-valider", STEP_DEFS, self.state(cadrage="review"))
        self.assertIsNone(updated)
        self.assertIn("Combien de personnes", message)

    def test_correction_and_skip(self):
        updated, message = steps.on_prompt("/daroms-corriger la cible est trop large", STEP_DEFS, self.state(cadrage="review"))
        self.assertEqual(updated["steps"]["cadrage"]["status"], "changes")
        self.assertIn("trop large", message)
        updated, _ = steps.on_prompt("/daroms-corriger", STEP_DEFS, self.state(cadrage="review"))
        self.assertIsNone(updated)
        updated, _ = steps.on_prompt("/daroms-valider passer : pas de juriste", STEP_DEFS, self.state(cadrage="done", conception="done", donnees="done", developpement="done", qualite="done"))
        self.assertEqual(updated["steps"]["conformite"]["status"], "skipped")
        self.assertEqual(updated["steps"]["conformite"]["note"], "pas de juriste")

    def test_other_messages_are_ignored(self):
        self.assertEqual(steps.on_prompt("valide le code stp", STEP_DEFS, self.state()), (None, ""))

    def test_gate_blocks_later_steps_only(self):
        state = self.state(cadrage="review")
        self.assertIn("attend la validation", steps.gate("Skill", {"skill": "daroms-brand"}, STEP_DEFS, state))
        self.assertIsNone(steps.gate("Skill", {"skill": "daroms-idea"}, STEP_DEFS, state))
        self.assertIsNone(steps.gate("Skill", {"skill": "daroms-commit"}, STEP_DEFS, state))
        self.assertIsNone(steps.gate("Skill", {"skill": "daroms-brand"}, STEP_DEFS, self.state(cadrage="done")))

    def test_agent_cannot_validate(self):
        state = self.state()
        self.assertIn("réservé", steps.gate("Skill", {"skill": "daroms-valider"}, STEP_DEFS, state))
        self.assertIsNotNone(steps.gate("Write", {"file_path": "/app/app.steps.json"}, STEP_DEFS, state))
        self.assertIsNotNone(steps.gate("Bash", {"command": "echo '{}' > app.steps.json"}, STEP_DEFS, state))
        self.assertIsNotNone(steps.gate("Bash", {"command": "bun daroms steps validate 1"}, STEP_DEFS, state))
        self.assertIsNone(steps.gate("Bash", {"command": "bun daroms steps ready 1 \"fait\""}, STEP_DEFS, state))

    def test_current_step_starts(self):
        state = self.state()
        self.assertTrue(steps.mark_doing(STEP_DEFS, state, "Skill", {"skill": "daroms-idea"}))
        self.assertEqual(state["steps"]["cadrage"]["status"], "doing")
        self.assertFalse(steps.mark_doing(STEP_DEFS, state, "Skill", {"skill": "daroms-brand"}))
