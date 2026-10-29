import type { IconComponent } from '../icons'
import { Card } from './Card'
import { Caption, Title } from './Text'

/**
 * @catalog Stat
 * @props value (nombre ou texte formaté) · label · tone: default|brand|accent|success · icon. Carte qui s'étire (flex 1) : en XStack pour une rangée de chiffres clés
 * @example <XStack gap="stack"><Stat value={week} label={t('stats.week')} tone="brand" /><Stat value={streak} label={t('stats.streak')} icon={Flame} /></XStack>
 */
export function Stat({
  value,
  label,
  tone = 'brand',
  icon: Icon,
}: {
  value: number | string
  label: string
  tone?: 'default' | 'brand' | 'accent' | 'success'
  icon?: IconComponent
}) {
  return (
    <Card flex={1} items="center" gap="0-5" py="section" aria-label={`${value} ${label}`}>
      {Icon ? <Icon size="5" color="color-9" /> : null}
      <Title size="8" tone={tone}>
        {value}
      </Title>
      <Caption align="center" numberOfLines={2}>
        {label}
      </Caption>
    </Card>
  )
}
