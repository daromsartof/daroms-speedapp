// Preset Jest daroms : jest-expo + Testing Library, transpile les paquets ESM du cœur et de Tamagui.
const TRANSPILE = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  'expo(nent)?',
  '@expo(nent)?/.*',
  'expo-.*',
  'react-navigation',
  '@react-navigation/.*',
  'react-native-.*',
  'tamagui',
  '@tamagui/.*',
  '@daroms/.*',
  '@shopify/flash-list',
  '@supabase/.*',
  'standard-navigation',
]

// Tamagui v3 publie des .mjs : on étend la transformation babel de jest-expo à ces fichiers.
function transformWithMjs() {
  const { transform } = require('jest-expo/jest-preset')
  return Object.fromEntries(
    Object.entries(transform).map(([pattern, value]) => [pattern === '\\.[jt]sx?$' ? '\\.m?[jt]sx?$' : pattern, value]),
  )
}

/** @param {Record<string, unknown>} overrides */
module.exports = function darOmsJest(overrides = {}) {
  return {
    preset: 'jest-expo',
    transform: transformWithMjs(),
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'node'],
    transformIgnorePatterns: [`node_modules/(?!(${TRANSPILE.join('|')})/)`],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/core/', '<rootDir>/e2e/', '<rootDir>/template/'],
    setupFiles: [require.resolve('./jest.setup.js')],
    ...overrides,
  }
}
