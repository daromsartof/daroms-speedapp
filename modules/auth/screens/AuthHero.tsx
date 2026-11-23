import { Body, Gradient, Illustration, Reveal, Title, YStack } from '@daroms/ui'

/** En-tête des écrans de connexion : scène sécurité sur halo de marque, titre qui entre en douceur. */
export function AuthHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <YStack position="relative" z="base" gap="tight" pt="tight" pb="stack" items="center" rounded="sheet" overflow="hidden">
      <Gradient kind="halo" />
      <Illustration name="secure" size="sm" />
      <Reveal delay={100}>
        <Title align="center">{title}</Title>
        <Body tone="muted" align="center">{subtitle}</Body>
      </Reveal>
    </YStack>
  )
}
