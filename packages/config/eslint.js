// Règles daroms (plan §5) traduites en ESLint quand c'est possible.
// Les règles non exprimables ici sont vérifiées par core/_ai/hooks/daroms-check-rules.py.
const expoConfig = require('eslint-config-expo/flat')

const HEX = '/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/'
const STYLE_PROPS =
  '/^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|rowGap|columnGap|rounded|w|h|minW|maxW|minH|maxH|width|height|top|left|right|bottom|t|l|r|b|fontSize|lineHeight|letterSpacing|borderRadius|padding[A-Za-z]*|margin[A-Za-z]*)$/'

const UI_LIBS = [
  'react-native-paper',
  'native-base',
  'react-native-elements',
  '@rneui/*',
  '@gluestack-ui/*',
  'react-native-ui-lib',
  '@ui-kitten/*',
  'nativewind',
  'react-native-vector-icons',
  'react-native-vector-icons/*',
  '@expo/vector-icons',
  '@expo/vector-icons/*',
  'lucide-react-native',
  '@tamagui/lucide-icons',
]

const baseRestrictedImports = ({ allowSupabase, allowRnPrimitives, allowRelativeParent = allowRnPrimitives }) => ({
  paths: [
    {
      name: 'react-native',
      importNames: allowRnPrimitives
        ? ['StyleSheet', 'FlatList', 'SectionList']
        : ['StyleSheet', 'FlatList', 'SectionList', 'Image', 'Text', 'View', 'ScrollView', 'Pressable', 'TouchableOpacity', 'Animated'],
      message:
        'Utiliser @daroms/ui (Screen, List, Image, Text, YStack...) et les tokens Tamagui. Animations : Reanimated.',
    },
    ...(allowSupabase
      ? []
      : [
          {
            name: '@daroms/data',
            importNames: ['db', 'getSupabase'],
            message: 'Accès Supabase uniquement dans src/features/<x>/api.ts.',
          },
        ]),
  ],
  patterns: [
    { group: UI_LIBS, message: 'Librairie UI ou jeu d icônes tiers interdit : @daroms/ui et @daroms/ui/icons.' },
    ...(allowSupabase
      ? []
      : [{ group: ['@supabase/*'], message: 'Supabase passe par @daroms/data dans features/<x>/api.ts.' }]),
    ...(allowRelativeParent ? [] : [{ regex: '^\\.\\./', message: 'Imports absolus @/ (pas de ../).' }]),
  ],
})

const styleSyntax = ({ allowHex }) => [
  ...(allowHex
    ? []
    : [
        { selector: `Literal[value=${HEX}]`, message: 'Couleur hex interdite : token de thème (color-11, background, brand...).' },
        { selector: 'Literal[value=/^(rgb|hsl)a?\\(/]', message: 'Couleur rgb/hsl interdite : token de thème.' },
      ]),
  { selector: "MemberExpression[object.name='StyleSheet'][property.name='create']", message: 'StyleSheet.create interdit : props Tamagui.' },
  {
    selector: `JSXAttribute[name.name=${STYLE_PROPS}] > JSXExpressionContainer > Literal[value>0]`,
    message: 'Nombre magique : utiliser un token (p="4", gap="stack", rounded="card").',
  },
  {
    selector: `JSXAttribute[name.name=${STYLE_PROPS}] > Literal[value=/\\d+px/]`,
    message: 'Valeur en px interdite : utiliser un token.',
  },
  { selector: 'Literal[value=/\\p{Extended_Pictographic}/u]', message: 'Pas d emoji dans le code ni les textes.' },
  { selector: 'Literal[value=/—/]', message: 'Pas de tiret long dans les textes.' },
]

const appSyntax = [
  { selector: 'JSXText[value=/[A-Za-zÀ-ÿ0-9]/]', message: "Texte en dur dans le JSX : t('cle')." },
  {
    selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
    message: 'Style inline interdit : props Tamagui avec tokens.',
  },
]

const routeSyntax = [
  {
    selector: ':matches(FunctionDeclaration, ArrowFunctionExpression, ClassDeclaration, VariableDeclaration, JSXElement)',
    message: "Route mince : app/** réexporte seulement un écran (export { default } from '@/features/x/XScreen').",
  },
]

/**
 * Configuration ESLint daroms.
 * @param {{ kind?: 'app' | 'core' }} options
 */
module.exports = function darOmsEslint({ kind = 'app' } = {}) {
  const isCore = kind === 'core'
  const common = {
    '@typescript-eslint/no-explicit-any': 'error',
    'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    'import/no-unresolved': 'off',
    // TypeScript vérifie déjà les exports ; ces règles donnent des faux positifs
    'import/namespace': 'off',
    'import/no-named-as-default-member': 'off',
  }
  return [
    ...expoConfig,
    {
      ignores: [
        '**/node_modules/**',
        '**/.expo/**',
        '**/dist/**',
        'ios/**',
        'android/**',
        '**/src/generated/**',
        '**/src/types/db.ts',
        '**/icons/lucide/**',
        '**/.claude/**',
        ...(isCore ? ['template/**', 'generators/**/files/**', '_ai/**', 'packages/config/**', 'docs/**', '*.config.js'] : ['core/**']),
      ],
    },
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        ...common,
        'no-restricted-imports': ['error', baseRestrictedImports({ allowSupabase: isCore, allowRnPrimitives: isCore })],
        'no-restricted-syntax': ['error', ...styleSyntax({ allowHex: false }), ...(isCore ? [] : appSyntax)],
      },
    },
    {
      // api.ts : seul endroit où Supabase est permis côté app
      files: ['**/api.ts'],
      rules: {
        'no-restricted-imports': ['error', baseRestrictedImports({ allowSupabase: true, allowRnPrimitives: isCore })],
      },
    },
    {
      files: ['app/**/*.tsx'],
      rules: { 'no-restricted-syntax': ['error', ...routeSyntax] },
    },
    {
      // fichiers de configuration et tests : souplesse
      files: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/testing/**', '**/__typetest__/**', '*.config.{js,ts}', '**/expo-config.ts', 'brand.ts', '**/theme/src/**', 'scripts/**', 'cli/**'],
      rules: {
        'no-restricted-syntax': ['error', ...styleSyntax({ allowHex: true }).filter((s) => !s.message.startsWith('Nombre'))],
        'max-lines': 'off',
      },
    },
  ]
}
