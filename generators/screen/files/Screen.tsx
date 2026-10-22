import { useT } from '@daroms/i18n'
import { Body, Card, Header, QueryView, Screen } from '@daroms/ui'
import { {{Icon}} } from '@daroms/ui/icons'

import { use{{Name}}Screen } from './hooks'

export default function {{Name}}Screen() {
  const t = useT()
  const { query } = use{{Name}}Screen()
  return (
    <Screen header={<Header title={t('{{key}}.title')} {{headerProps}}/>} onRefresh={() => void query.refetch()} refreshing={query.isRefetching}>
      <QueryView query={query} empty={{ icon: {{Icon}}, title: t('{{key}}.emptyTitle'), description: t('{{key}}.emptyDescription') }}>
        {(items) =>
          items.map((item) => (
            <Card key={item.id}>
              <Body>{item.{{displayField}}}</Body>
            </Card>
          ))
        }
      </QueryView>
    </Screen>
  )
}
