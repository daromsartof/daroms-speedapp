import { Image as ExpoImage, type ImageContentFit, type ImageSource } from 'expo-image'
import { YStack, type YStackProps } from 'tamagui'

export type ImageProps = Pick<YStackProps, 'w' | 'h' | 'rounded' | 'flex'> & {
  source: ImageSource | string | null | undefined
  /** Ratio largeur/hauteur (défaut 1). */
  ratio?: number
  alt: string
  contentFit?: ImageContentFit
  /** Blurhash ou thumbhash affiché pendant le chargement. */
  placeholder?: string
}

/**
 * @catalog Image
 * @props source (uri ou require) · alt (requis) · ratio · rounded (défaut card) · contentFit · placeholder (blurhash)
 * @example <Image source={product.image_url} alt={product.name} ratio={4 / 3} />
 */
export function Image({ source, ratio = 1, alt, contentFit = 'cover', placeholder, rounded = 'card', w = '100%', h, flex }: ImageProps) {
  const resolved = typeof source === 'string' ? { uri: source } : source
  return (
    <YStack w={w} h={h} flex={flex} aspectRatio={h ? undefined : ratio} rounded={rounded} overflow="hidden" bg="skeleton">
      {resolved ? (
        <ExpoImage
          source={resolved}
          placeholder={placeholder ? { blurhash: placeholder } : undefined}
          accessibilityLabel={alt}
          contentFit={contentFit}
          transition={200}
          style={{ flex: 1 }}
        />
      ) : null}
    </YStack>
  )
}
