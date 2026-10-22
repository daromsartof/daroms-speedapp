import { useT } from '@daroms/i18n'
import { Body, Card, Header, ListItem, Screen, Title } from '@daroms/ui'
import { LayoutGrid, Sparkles } from '@daroms/ui/icons'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const t = useT()
  const router = useRouter()
  return (
    <Screen header={<Header title={t('home.title')} large />}>
      <Card gap="tight">
        <Sparkles size="8" color="brand-500" />
        <Title size="7">{t('home.welcome')}</Title>
        <Body tone="muted">{t('home.intro')}</Body>
      </Card>
      {__DEV__ ? (
        <Card padded={false}>
          <ListItem icon={LayoutGrid} title={t('home.kitchenSink')} chevron onPress={() => router.push('/_dev/kitchen-sink')} />
        </Card>
      ) : null}
    </Screen>
  )
}
