import { useT } from '@daroms/i18n'
import { addDays, formatWeekday } from '@daroms/lib'
import {
  Avatar,
  Badge,
  BarChart,
  Body,
  Button,
  Caption,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  ListItem,
  notify,
  ProgressBar,
  Sheet,
  Skeleton,
  Stat,
  Tabs,
  XStack,
  YStack,
} from '@daroms/ui'
import { Bell, Flame, Heart, Plus, Settings, Star } from '@daroms/ui/icons'
import { useState } from 'react'

export function ActionsSection() {
  const t = useT()
  return (
    <YStack gap="inline">
      <Button icon={Plus}>{t('dev.primary')}</Button>
      <XStack gap="inline" flexWrap="wrap">
        <Button size="md" variant="secondary">{t('dev.secondary')}</Button>
        <Button size="md" variant="outline">{t('dev.outline')}</Button>
        <Button size="md" variant="ghost">{t('dev.ghost')}</Button>
        <Button size="md" variant="danger">{t('dev.danger')}</Button>
        <Button size="md" loading>{t('dev.primary')}</Button>
      </XStack>
      <XStack gap="inline">
        <IconButton icon={Heart} label={t('dev.like')} />
        <IconButton icon={Settings} label={t('dev.settings')} variant="secondary" />
        <IconButton icon={Bell} label={t('dev.notify')} variant="primary" onPress={() => notify.success(t('dev.toast'))} />
      </XStack>
      <Input placeholder={t('dev.placeholder')} />
      <Input placeholder={t('dev.placeholder')} invalid />
    </YStack>
  )
}

const WEEK = [3, 5, 0, 8, 4, 6, 2]

export function DisplaySection() {
  const t = useT()
  const [tab, setTab] = useState<'a' | 'b'>('a')
  const [chip, setChip] = useState(true)
  return (
    <YStack gap="inline">
      <Card>
        <XStack gap="inline" items="center">
          <Avatar name={t('dev.person')} size="lg" />
          <YStack flex={1}>
            <Body weight="bold">{t('dev.person')}</Body>
            <Caption>{t('dev.caption')}</Caption>
          </YStack>
          <Badge tone="success">{t('dev.badge')}</Badge>
        </XStack>
      </Card>
      <Card padded={false}>
        <ListItem icon={Star} title={t('dev.item')} subtitle={t('dev.caption')} chevron onPress={() => undefined} />
        <ListItem icon={Bell} title={t('dev.item')} value={t('dev.value')} />
      </Card>
      <XStack gap="inline" flexWrap="wrap">
        <Chip label={t('dev.chip')} selected={chip} onPress={() => setChip(!chip)} />
        {(['neutral', 'brand', 'accent', 'warning', 'danger'] as const).map((tone) => (
          <Badge key={tone} tone={tone}>{tone}</Badge>
        ))}
      </XStack>
      <Tabs tabs={[{ value: 'a', label: t('dev.tabA') }, { value: 'b', label: t('dev.tabB'), count: 3 }]} value={tab} onChange={setTab} />
      <ProgressBar value={0.62} />
      <XStack gap="inline">
        <Stat value={42} label={t('dev.statPages')} />
        <Stat value={7} label={t('dev.statStreak')} icon={Flame} tone="accent" />
      </XStack>
      <Card>
        <BarChart data={WEEK.map((value, i) => ({ key: String(i), label: formatWeekday(addDays(new Date(), i - 6), 'narrow'), value }))} label={t('dev.chart')} highlight="6" />
      </Card>
    </YStack>
  )
}

export function FeedbackSection() {
  const t = useT()
  const [sheet, setSheet] = useState(false)
  const [dialog, setDialog] = useState(false)
  return (
    <XStack gap="inline" flexWrap="wrap">
      <Button size="md" variant="secondary" onPress={() => setSheet(true)}>{t('dev.sheet')}</Button>
      <Button size="md" variant="secondary" onPress={() => setDialog(true)}>{t('dev.dialog')}</Button>
      <Button size="md" variant="secondary" onPress={() => notify.error(t('dev.toast'))}>{t('dev.toastError')}</Button>
      <Sheet open={sheet} onOpenChange={setSheet} title={t('dev.sheet')}>
        <Body>{t('dev.caption')}</Body>
        <Button onPress={() => setSheet(false)}>{t('dev.primary')}</Button>
      </Sheet>
      <Dialog open={dialog} onOpenChange={setDialog} title={t('dev.dialog')} description={t('dev.caption')} destructive onConfirm={() => setDialog(false)} />
    </XStack>
  )
}

export function StatesSection() {
  const t = useT()
  return (
    <YStack gap="inline">
      <Card gap="tight">
        <Skeleton w="66%" h="5" />
        <Skeleton w="33%" h="4" />
      </Card>
      <Card>
        <EmptyState icon={Star} actionLabel={t('dev.primary')} onAction={() => undefined} />
      </Card>
      <Card>
        <ErrorState onRetry={() => undefined} />
      </Card>
    </YStack>
  )
}
