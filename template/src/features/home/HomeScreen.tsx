import { useT } from '@daroms/i18n'
import { Card, Header, Hero, ListItem, Screen } from '@daroms/ui'
import { LayoutGrid } from '@daroms/ui/icons'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const t = useT()
  const router = useRouter()
  return (
    <Screen header={<Header title={t('home.title')} large />}>
      <Hero illustration="welcome" title={t('home.welcome')} subtitle={t('home.intro')} />
      {__DEV__ ? (
        <Card padded={false}>
          <ListItem icon={LayoutGrid} title={t('home.kitchenSink')} chevron onPress={() => router.push('/_dev/kitchen-sink')} />
        </Card>
      ) : null}
    </Screen>
  )
}
