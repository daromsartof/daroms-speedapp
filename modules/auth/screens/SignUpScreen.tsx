import { useTranslateKey } from '@daroms/i18n'
import { zEmail, zPassword, zRequired } from '@daroms/lib/zod'
import { Button, FormField, notify, Screen } from '@daroms/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter, type Href } from 'expo-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { authErrorKey, signUpWithEmail } from '../api'
import { useAuthT } from '../i18n'
import { AuthHero } from './AuthHero'
import { SocialButtons } from './SocialButtons'

const schema = z.object({ name: zRequired, email: zEmail, password: zPassword })
type Values = z.infer<typeof schema>

export function SignUpScreen() {
  const t = useAuthT()
  const translate = useTranslateKey()
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } })
  const signUp = useMutation({
    mutationFn: (values: Values) => signUpWithEmail(values.email, values.password, values.name),
    onSuccess: ({ needsConfirmation }) => {
      if (needsConfirmation) {
        notify.success(t('signUp.checkEmail'))
        router.replace('/sign-in' as Href)
      } else router.replace('/')
    },
    onError: (error) => notify.error(translate(authErrorKey(error))),
  })
  return (
    <Screen keyboard>
      <AuthHero title={t('signUp.title')} subtitle={t('signUp.subtitle')} />
      <FormField control={form.control} name="name" label={t('fields.name')} autoComplete="given-name" />
      <FormField control={form.control} name="email" label={t('fields.email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <FormField control={form.control} name="password" label={t('fields.password')} secureTextEntry autoComplete="new-password" />
      <Button fullWidth loading={signUp.isPending} onPress={() => void form.handleSubmit((values) => signUp.mutate(values))()}>
        {t('signUp.submit')}
      </Button>
      <SocialButtons />
      <Button variant="ghost" onPress={() => router.replace('/sign-in' as Href)}>
        {t('signUp.hasAccount')}
      </Button>
    </Screen>
  )
}
