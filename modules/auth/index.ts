import { defineModule } from '@daroms/app'

import { AuthProvider } from './AuthProvider'
import { authConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { useAuthSettings } from './settings'

export default defineModule({
  slug: 'auth',
  config: authConfig,
  Provider: AuthProvider,
  gate: true,
  locales: { fr: { auth: fr }, en: { auth: en } },
  useSettings: useAuthSettings,
})

export { deleteAccount, signInWithApple, signInWithEmail, signInWithGoogle, signOut, signUpWithEmail, useProfile, type Profile } from './api'
export { AuthLayout } from './screens/AuthLayout'
export { ForgotPasswordScreen } from './screens/ForgotPasswordScreen'
export { SignInScreen } from './screens/SignInScreen'
export { SignUpScreen } from './screens/SignUpScreen'
