// Accès Supabase Auth du module (cœur). Les écrans n'appellent que ces fonctions.
import { AppError, getSupabase, moduleDb, toAppError, unwrap, useUser } from '@daroms/data'
import { useQuery } from '@tanstack/react-query'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { z } from 'zod'

const auth = () => getSupabase().auth

/** Erreur Auth -> clé i18n (identifiants faux traités à part). */
export function authErrorKey(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? (error as { code: unknown }).code : undefined
  if (code === 'invalid_credentials') return 'auth:errors.invalidCredentials'
  return toAppError(error).messageKey
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await auth().signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await auth().signUp({
    email,
    password,
    options: { data: { display_name: displayName }, emailRedirectTo: Linking.createURL('/') },
  })
  if (error) throw error
  return { needsConfirmation: !data.session }
}

export async function sendPasswordReset(email: string) {
  const { error } = await auth().resetPasswordForEmail(email, { redirectTo: Linking.createURL('/sign-in') })
  if (error) throw error
}

export async function signOut() {
  const { error } = await auth().signOut()
  if (error) throw error
}

/** Google : OAuth PKCE dans le navigateur système, retour par le schéma de l'app. */
export async function signInWithGoogle(): Promise<boolean> {
  const redirectTo = Linking.createURL('/sign-in')
  const { data, error } = await auth().signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } })
  if (error) throw error
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
  if (result.type !== 'success') return false
  const code = Linking.parse(result.url).queryParams?.code
  if (typeof code !== 'string') throw new AppError('unauthorized', 'code OAuth absent')
  const exchanged = await auth().exchangeCodeForSession(code)
  if (exchanged.error) throw exchanged.error
  return true
}

/** Apple : jeton d'identité natif + nonce, vérifié par Supabase. */
export async function signInWithApple(): Promise<boolean> {
  const rawNonce = Crypto.randomUUID()
  const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce)
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce,
    })
    if (!credential.identityToken) throw new AppError('unauthorized', 'jeton Apple absent')
    const { error } = await auth().signInWithIdToken({ provider: 'apple', token: credential.identityToken, nonce: rawNonce })
    if (error) throw error
    return true
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') return false
    throw error
  }
}

export async function deleteAccount() {
  const { error } = await getSupabase().functions.invoke('delete-account', { method: 'POST' })
  if (error) throw toAppError(error)
  await auth().signOut()
}

export const ProfileSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
})

export type Profile = z.infer<typeof ProfileSchema>

/** Profil de l'utilisateur connecté (table profiles créée par la migration du module). */
export function useProfile() {
  const user = useUser()
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const result = await moduleDb().from('profiles').select('id, display_name, avatar_url').eq('id', user!.id).single()
      return ProfileSchema.parse(unwrap(result))
    },
  })
}
