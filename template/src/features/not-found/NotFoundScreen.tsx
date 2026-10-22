import { useT } from '@daroms/i18n'
import { EmptyState, Screen } from '@daroms/ui'
import { Compass } from '@daroms/ui/icons'
import { useRouter } from 'expo-router'

export default function NotFoundScreen() {
  const t = useT()
  const router = useRouter()
  return (
    <Screen scroll={false}>
      <EmptyState icon={Compass} title={t('notFound.title')} actionLabel={t('notFound.back')} onAction={() => router.replace('/')} />
    </Screen>
  )
}
