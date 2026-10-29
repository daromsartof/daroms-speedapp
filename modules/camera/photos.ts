// Photos : appareil photo ou galerie, puis envoi dans Supabase Storage (dossier de l'utilisateur).
// Fonctions sans hook : appelables depuis features/<x>/api.ts (mutation qui envoie puis enregistre l'URL).
import { AppError, getSupabase, toAppError } from '@daroms/data'
import { createId } from '@daroms/lib/id'
import * as ImagePicker from 'expo-image-picker'

import { cameraConfig, type CameraConfig } from './config'

export type Photo = { uri: string; width: number; height: number; mimeType: string }
export type PhotoSource = 'camera' | 'library'
export type UploadedPhoto = { path: string; url: string }

let config: CameraConfig = cameraConfig.parse({})

/** Appelé par le module au démarrage (manifest.modules.camera). */
export function configureCamera(next: CameraConfig) {
  config = next
}

/**
 * Ouvre l'appareil photo ou la galerie ; null si l'utilisateur annule.
 * La galerie système ne demande pas de permission ; l'appareil photo oui (AppError `forbidden` si refusée).
 */
export async function pickPhoto(source: PhotoSource, { aspect = config.aspect }: { aspect?: [number, number] } = {}): Promise<Photo | null> {
  if (source === 'camera' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
    throw new AppError('forbidden', 'permission appareil photo refusée')
  }
  const launch = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync
  const result = await launch({ mediaTypes: ['images'], quality: config.quality, allowsEditing: Boolean(aspect), aspect })
  const asset = result.canceled ? undefined : result.assets[0]
  if (!asset) return null
  return { uri: asset.uri, width: asset.width, height: asset.height, mimeType: asset.mimeType ?? 'image/jpeg' }
}

/** Envoie la photo dans `<bucket>/<user_id>/<id>.<ext>` ; renvoie le chemin et l'URL publique. */
export async function uploadPhoto(photo: Photo): Promise<UploadedPhoto> {
  const supabase = getSupabase()
  const userId = (await supabase.auth.getSession()).data.session?.user.id
  if (!userId) throw new AppError('unauthorized')
  const extension = (photo.mimeType.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg')
  const path = `${userId}/${createId()}.${extension}`
  try {
    const body = await (await fetch(photo.uri)).arrayBuffer()
    const bucket = supabase.storage.from(config.bucket)
    const { error } = await bucket.upload(path, body, { contentType: photo.mimeType })
    if (error) throw error
    return { path, url: bucket.getPublicUrl(path).data.publicUrl }
  } catch (error) {
    throw toAppError(error)
  }
}

/** Supprime une photo envoyée (chemin renvoyé par uploadPhoto). */
export async function removePhoto(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(config.bucket).remove([path])
  if (error) throw toAppError(error)
}
