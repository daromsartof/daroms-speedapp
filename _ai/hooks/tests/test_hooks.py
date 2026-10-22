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


class Common(unittest.TestCase):
    def test_catalog_block(self):
        source = "/**\n * @catalog Button\n * @props variant\n * @example <Button />\n */"
        self.assertEqual(common.parse_catalog_blocks(source), [{"name": "Button", "props": "variant", "example": "<Button />"}])

    def test_rule_description(self):
        self.assertEqual(common.rule_description("---\npaths: x\n---\n# Titre\n\n> Résumé court.\n"), "Résumé court.")


if __name__ == "__main__":
    unittest.main()
