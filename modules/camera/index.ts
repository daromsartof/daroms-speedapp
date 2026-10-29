import { defineModule } from '@daroms/app'

import { cameraConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { configureCamera } from './photos'

export default defineModule({
  slug: 'camera',
  config: cameraConfig,
  init: configureCamera,
  locales: { fr: { camera: fr }, en: { camera: en } },
})

export { PhotoPicker, type PhotoPickerProps } from './PhotoPicker'
export { pickPhoto, removePhoto, uploadPhoto, type Photo, type PhotoSource, type UploadedPhoto } from './photos'
