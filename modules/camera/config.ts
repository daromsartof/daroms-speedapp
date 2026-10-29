import { z } from 'zod'

export const cameraConfig = z.object({
  /** Bucket Supabase Storage (créé par la migration du module, lecture publique). */
  bucket: z.string().default('images'),
  /** Compression JPEG, de 0 à 1. */
  quality: z.number().min(0).max(1).default(0.7),
  /** Recadrage imposé par défaut, ex. [1, 1] pour un avatar (sinon photo entière). */
  aspect: z.tuple([z.number().positive(), z.number().positive()]).optional(),
  /** Textes iOS des permissions (plugin) : défaut dans la langue par défaut de l'app. */
  cameraPermission: z.string().optional(),
  photosPermission: z.string().optional(),
})

export type CameraConfig = z.infer<typeof cameraConfig>
