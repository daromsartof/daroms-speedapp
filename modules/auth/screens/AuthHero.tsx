import { Body, getDirection, Gradient, Illustration, Reveal, Title, YStack } from '@daroms/ui'

/** En-tête des écrans de connexion : scène sécurité sur halo de marque, titre qui entre en douceur. */
export function AuthHero({ title, subtitle }: { title: string; subtitle: string }) {
  // vivid : bandeau en dégradé plein, texte clair ; sinon halo clair
  const bold = getDirection().gradient === 'vivid'
  const on = bold ? { color: 'on-gradient' as const } : {}
  return (
    <YStack position="relative" z="base" gap="tight" pt="tight" pb="stack" items="center" rounded="sheet" overflow="hidden">
      <Gradient kind={bold ? 'brand' : 'halo'} />
      <Illustration name="secure" size="sm" />
      <Reveal delay={100}>
        <Title align="center" {...on}>{title}</Title>
        <Body tone={bold ? undefined : 'muted'} align="center" {...on} opacity={bold ? 0.88 : 1}>{subtitle}</Body>
      </Reveal>
    </YStack>
  )
}
