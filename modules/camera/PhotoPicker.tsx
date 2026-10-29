import { toAppError } from '@daroms/data'
import { Body, Card, Image, ListItem, notify, Sheet, YStack } from '@daroms/ui'
import { Camera, Image as ImageIcon, Trash2 } from '@daroms/ui/icons'
import { useState } from 'react'

import { useCameraT } from './i18n'
import { pickPhoto, type Photo, type PhotoSource } from './photos'

export type PhotoPickerProps = {
  /** URI affichée : photo locale choisie ou URL déjà enregistrée. */
  value?: string | null
  /** Photo locale choisie (à envoyer avec uploadPhoto à l'enregistrement), null si retirée. */
  onChange: (photo: Photo | null) => void
  label?: string
  /** Ratio d'affichage (défaut 4/3) ; `aspect` impose un recadrage à la prise de vue. */
  ratio?: number
  aspect?: [number, number]
}

/** Zone photo : toucher ouvre une feuille appareil photo / galerie / retirer. */
export function PhotoPicker({ value, onChange, label, ratio = 4 / 3, aspect }: PhotoPickerProps) {
  const t = useCameraT()
  const [open, setOpen] = useState(false)
  const title = label ?? t('title')

  const choose = async (source: PhotoSource) => {
    setOpen(false)
    try {
      const photo = await pickPhoto(source, aspect ? { aspect } : {})
      if (photo) onChange(photo)
    } catch (error) {
      notify.error(toAppError(error).code === 'forbidden' ? t('denied') : t('failed'))
    }
  }

  return (
    <>
      <Card pressable padded={false} role="button" aria-label={value ? t('change') : t('add')} onPress={() => setOpen(true)}>
        {value ? (
          <Image source={value} alt={title} ratio={ratio} rounded="0" />
        ) : (
          <YStack aspectRatio={ratio} items="center" justify="center" gap="tight" bg="color-2">
            <Camera size="8" color="color-8" />
            <Body tone="muted">{t('add')}</Body>
          </YStack>
        )}
      </Card>
      <Sheet open={open} onOpenChange={setOpen} title={title} snapPoints={[40]}>
        <YStack>
          <ListItem icon={Camera} title={t('take')} onPress={() => void choose('camera')} />
          <ListItem icon={ImageIcon} title={t('library')} onPress={() => void choose('library')} />
          {value ? (
            <ListItem
              icon={Trash2}
              title={t('remove')}
              destructive
              onPress={() => {
                setOpen(false)
                onChange(null)
              }}
            />
          ) : null}
        </YStack>
      </Sheet>
    </>
  )
}
