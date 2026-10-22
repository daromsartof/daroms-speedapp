import { Body, Title, YStack } from '@daroms/ui'
import { KeyRound } from '@daroms/ui/icons'

export function AuthHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <YStack gap="tight" pt="section" pb="stack">
      <YStack theme="brand" bg="background" w="12" h="12" rounded="card" items="center" justify="center" mb="tight">
        <KeyRound size="7" color="color" />
      </YStack>
      <Title>{title}</Title>
      <Body tone="muted">{subtitle}</Body>
    </YStack>
  )
}
