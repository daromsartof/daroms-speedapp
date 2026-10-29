import { z } from 'zod'

const point = z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })

export const mapsConfig = z.object({
  /** Centre par défaut quand il n'y a ni marqueur ni position (Paris). */
  center: point.default({ latitude: 48.8566, longitude: 2.3522 }),
  /** Zoom par défaut : degrés de latitude visibles (0.05 = un quartier, 0.5 = une ville). */
  span: z.number().positive().default(0.05),
  /** Texte iOS de la permission de localisation (plugin) : défaut selon la langue par défaut de l'app. */
  locationPermission: z.string().optional(),
})

export type MapsConfig = z.infer<typeof mapsConfig>
