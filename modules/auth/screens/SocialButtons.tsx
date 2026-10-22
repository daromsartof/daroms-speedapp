import { useModuleConfig } from '@daroms/app'
import { useTranslateKey } from '@daroms/i18n'
import { Button, Caption, notify, Separator, XStack, YStack } from '@daroms/ui'
import { useMutation } from '@tanstack/react-query'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

import { authErrorKey, signInWithApple, signInWithGoogle } from '../api'
import type { AuthConfig } from '../config'
import { useAuthT } from '../i18n'

export function SocialButtons() {
  const t = useAuthT()
  const translate = useTranslateKey()
  const router = useRouter()
  const { providers } = useModuleConfig<AuthConfig>('auth')
  const [appleAvailable, setAppleAvailable] = useState(false)
  useEffect(() => {
    if (Platform.OS === 'ios' && providers.includes('apple')) void AppleAuthentication.isAvailableAsync().then(setAppleAvailable)
  }, [providers])
  const social = useMutation({
    mutationFn: (provider: 'apple' | 'google') => (provider === 'apple' ? signInWithApple() : signInWithGoogle()),
    onSuccess: (signedIn) => (signedIn ? router.replace('/') : undefined),
    onError: (error) => notify.error(translate(authErrorKey(error))),
  })
  const google = providers.includes('google')
  if (!google && !appleAvailable) return null
  return (
    <YStack gap="inline">
      <XStack items="center" gap="inline">
        <Separator borderColor="separator" />
        <Caption>{t('social.or')}</Caption>
        <Separator borderColor="separator" />
      </XStack>
      {appleAvailable ? (
        <Button variant="secondary" fullWidth loading={social.isPending && social.variables === 'apple'} onPress={() => social.mutate('apple')}>
          {t('social.apple')}
        </Button>
      ) : null}
      {google ? (
        <Button variant="outline" fullWidth loading={social.isPending && social.variables === 'google'} onPress={() => social.mutate('google')}>
          {t('social.google')}
        </Button>
      ) : null}
    </YStack>
  )
}
