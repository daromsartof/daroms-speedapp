// Fichiers de police à passer à useFonts (expo-font). Séparé pour ne pas charger
// les assets dans les contextes Node (app.config.ts, tests de thème).
export const interFontFiles = {
  Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
  InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
  InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  InterExtraBold: require('@tamagui/font-inter/otf/Inter-ExtraBold.otf'),
} as const
