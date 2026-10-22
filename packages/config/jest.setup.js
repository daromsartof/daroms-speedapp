// Mocks communs aux tests daroms (exécutés avant chaque fichier de test).
process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321'
process.env.EXPO_PUBLIC_SUPABASE_KEY ??= 'test-key'
process.env.TAMAGUI_TARGET ??= 'native'

// Reanimated 4 ne s'initialise pas sous Jest : le driver d'animation Tamagui
// est remplacé par celui de React Native Animated (même format de config).
jest.mock('@tamagui/animations-reanimated', () => require('@tamagui/animations-react-native'))
jest.mock('react-native-reanimated', () => require('./mocks/reanimated.js'))
jest.mock('react-native-worklets', () => ({ scheduleOnRN: (fn, ...args) => fn(...args), scheduleOnUI: (fn) => fn }))

// expo-router : navigation simulée pour les tests d'écran
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router')
  const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn(), canGoBack: () => true }
  return { ...actual, useRouter: () => router, router, useLocalSearchParams: () => ({}), useGlobalSearchParams: () => ({}) }
})
