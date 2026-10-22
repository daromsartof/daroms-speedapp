// Vérifications de typage (tsc) : tokens sémantiques et thèmes de marque.
import { Text, Theme, YStack } from 'tamagui'

import '../augment'

export const ok = (
  <Theme name="brand">
    <YStack
      p="gutter"
      gap="stack"
      rounded="card"
      bg="background"
      borderColor="border-color"
      z="toast"
    >
      <Text color="color-11" fontFamily="heading" fontSize="6">
        ok
      </Text>
    </YStack>
  </Theme>
)
export const ok2 = <YStack flex={1} opacity={0.5} borderWidth={1} w="100%" />
const unknownTheme = 'nope'
// @ts-expect-error thème inconnu
export const ko1 = <Theme name={unknownTheme} />
// Les couleurs hex et nombres magiques sont refusés par ESLint et le hook daroms-check-rules.
export const ok3 = <YStack bg="card" borderColor="separator" theme="soft" />
