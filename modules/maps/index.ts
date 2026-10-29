import { defineModule } from '@daroms/app'

import { mapsConfig } from './config'
import { configureMaps } from './defaults'
import en from './locales/en.json'
import fr from './locales/fr.json'

export default defineModule({
  slug: 'maps',
  config: mapsConfig,
  init: configureMaps,
  locales: { fr: { maps: fr }, en: { maps: en } },
})

export { distanceKm, formatDistance, regionFor, sortByDistance, type LatLng, type Region } from './geo'
export { getCurrentLocation, openInMaps, useCurrentLocation } from './location'
export { Map } from './Map'
export type { MapMarker, MapProps } from './types'
