import { useTranslateKey } from '@daroms/i18n'
import { zEmail } from '@daroms/lib/zod'
import { Button, FormField, Header, notify, Screen } from '@daroms/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { authErrorKey, sendPasswordReset } from '../api'
import { useAuthT } from '../i18n'
import { AuthHero } from './AuthHero'

const schema = z.object({ email: zEmail })
type Values = z.infer<typeof schema>

export function ForgotPasswordScreen() {
  const t = useAuthT()
  const translate = useTranslateKey()
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } })
  const reset = useMutation({
    mutationFn: (values: Values) => sendPasswordReset(values.email),
    onSuccess: () => {
      notify.success(t('forgot.sent'))
      router.back()
    },
    onError: (error) => notify.error(translate(authErrorKey(error))),
  })
  return (
    <Screen keyboard header={<Header title="" back />}>
      <AuthHero title={t('forgot.title')} subtitle={t('forgot.subtitle')} />
      <FormField control={form.control} name="email" label={t('fields.email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Button fullWidth loading={reset.isPending} onPress={() => void form.handleSubmit((values) => reset.mutate(values))()}>
        {t('forgot.submit')}
      </Button>
    </Screen>
  )
}
