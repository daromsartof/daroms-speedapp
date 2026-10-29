# Module camera

Photos prises ou choisies (expo-image-picker, fonctionne dans Expo Go), envoyées dans Supabase Storage. Requiert `auth`.

- Activer : `bun daroms module add camera` (migration : bucket `images` public en lecture par URL, écriture et suppression limitées au dossier `<user_id>/`).
- Configuration (`modules.camera`) : `bucket` (défaut `images` ; autre nom = adapter la migration), `quality` (0.7), `aspect` (ex. `[1, 1]` pour un avatar), `cameraPermission` et `photosPermission` (textes iOS, défaut selon `defaultLocale`).
- Écran : `<PhotoPicker value={photo?.uri ?? item.image_url} onChange={setPhoto} />` (feuille appareil photo, galerie, retirer).
- Envoi dans `api.ts`, au moment d'enregistrer :
  ```ts
  import { uploadPhoto, type Photo } from '@daroms/module-camera'
  mutationFn: async ({ photo, ...input }: PostInput & { photo: Photo | null }) => {
    const image = photo ? await uploadPhoto(photo) : null
    return insertPost({ ...input, image_url: image?.url ?? null })
  }
  ```
- `pickPhoto('camera' | 'library')` et `removePhoto(path)` pour un usage sans composant.
- Colonne d'image : `image_url:text?` dans `g table`.
