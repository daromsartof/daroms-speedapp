import type { LatLng } from './geo'

export type MapMarker = LatLng & { id: string; title?: string; description?: string }

export type MapProps = {
  /** Description pour les lecteurs d'écran (requis). */
  label: string
  markers?: readonly MapMarker[]
  /** Centre imposé ; sinon la carte englobe les marqueurs (ou le centre du manifest). */
  center?: LatLng
  /** Zoom : degrés de latitude visibles (défaut manifest, 0.05). */
  span?: number
  onMarkerPress?: (marker: MapMarker) => void
  /** Point bleu de l'utilisateur (demande la permission de localisation). */
  showsUserLocation?: boolean
  /** Ratio largeur/hauteur (défaut 1) ; `flex` pour remplir l'écran. */
  ratio?: number
  flex?: number
}
