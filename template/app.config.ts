import { withDaroms } from '@daroms/app/expo-config'
import type { ConfigContext, ExpoConfig } from 'expo/config'

import manifest from './app.manifest.ts'
import brand from './brand.ts'

// Dérivé du manifest et de la marque : ne rien coder en dur ici.
export default (ctx: ConfigContext): ExpoConfig => withDaroms(ctx, { manifest, brand })
