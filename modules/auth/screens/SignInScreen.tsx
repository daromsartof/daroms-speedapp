import { useTranslateKey } from '@daroms/i18n'
import { zEmail, zRequired } from '@daroms/lib/zod'
import { Button, Caption, FormField, notify, Screen } from '@daroms/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter, type Href } from 'expo-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { authErrorKey, signInWithEmail } from '../api'
import { useAuthT } from '../i18n'
import { AuthHero } from './AuthHero'
import { SocialButtons } from './SocialButtons'

const schema = z.object({ email: zEmail, password: zRequired })
type Values = z.infer<typeof schema>

export function SignInScreen() {
  const t = useAuthT()
  const translate = useTranslateKey()
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })
  const signIn = useMutation({
    mutationFn: (values: Values) => signInWithEmail(values.email, values.password),
    onSuccess: () => router.replace('/'),
    onError: (error) => notify.error(translate(authErrorKey(error))),
  })
  return (
    <Screen keyboard>
      <AuthHero title={t('signIn.title')} subtitle={t('signIn.subtitle')} />
      <FormField control={form.control} name="email" label={t('fields.email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <FormField control={form.control} name="password" label={t('fields.password')} secureTextEntry autoComplete="current-password" />
      <Caption tone="brand" align="end" onPress={() => router.push('/forgot-password' as Href)}>
        {t('signIn.forgot')}
      </Caption>
      <Button fullWidth loading={signIn.isPending} onPress={() => void form.handleSubmit((values) => signIn.mutate(values))()}>
        {t('signIn.submit')}
      </Button>
      <SocialButtons />
      <Button variant="ghost" onPress={() => router.replace('/sign-up' as Href)}>
        {t('signIn.noAccount')}
      </Button>
    </Screen>
  )
}
