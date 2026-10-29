// Calculs géographiques purs (testés) : région englobante, distance, lien vers l'app de cartes.
export type LatLng = { latitude: number; longitude: number }
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number }

/** Région qui englobe les points avec une marge (au moins `span` degrés), sinon centrée sur `fallback`. */
export function regionFor(points: readonly LatLng[], fallback: LatLng, span = 0.05): Region {
  if (points.length === 0) return { ...fallback, latitudeDelta: span, longitudeDelta: span }
  const lats = points.map((p) => p.latitude)
  const lngs = points.map((p) => p.longitude)
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)]
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(span, (maxLat - minLat) * 1.4),
    longitudeDelta: Math.max(span, (maxLng - minLng) * 1.4),
  }
}

const EARTH_KM = 6371

/** Distance à vol d'oiseau en kilomètres (haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(b.latitude - a.latitude)
  const dLng = rad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

/** « 850 m », « 3,2 km » selon la langue. */
export function formatDistance(km: number, locale: string): string {
  const meters = km < 1
  const value = meters ? Math.round(km * 100) * 10 : km
  return new Intl.NumberFormat(locale, { style: 'unit', unit: meters ? 'meter' : 'kilometer', maximumFractionDigits: km < 10 ? 1 : 0 }).format(value)
}

/** Points triés du plus proche au plus lointain d'une origine. */
export function sortByDistance<T extends LatLng>(points: readonly T[], origin: LatLng): T[] {
  return [...points].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b))
}

/** Lien universel Apple Plans (iOS) / Google Maps (Android, web) vers un point. */
export function mapsUrl(point: LatLng, label: string | undefined, os: string): string {
  const ll = `${point.latitude},${point.longitude}`
  const q = encodeURIComponent(label ?? ll)
  if (os === 'ios') return `https://maps.apple.com/?ll=${ll}&q=${q}`
  if (os === 'android') return `geo:${ll}?q=${ll}(${q})`
  return `https://www.google.com/maps/search/?api=1&query=${ll}`
}
