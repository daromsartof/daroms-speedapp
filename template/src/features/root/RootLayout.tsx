import { createRootLayout } from '@daroms/app'

import { modules } from '@/generated/modules'
import brand from '~/brand'
import en from '~/locales/en.json'
import fr from '~/locales/fr.json'
import config from '~/tamagui.config'

export default createRootLayout({
  config,
  modules,
  locales: { fr, en },
  supabase: { url: process.env.EXPO_PUBLIC_SUPABASE_URL, key: process.env.EXPO_PUBLIC_SUPABASE_KEY },
  loadInter: brand.font === 'inter',
})
