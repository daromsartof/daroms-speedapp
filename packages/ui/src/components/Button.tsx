import { haptic, type HapticKind } from '@daroms/lib/haptics'
import { Button as TButton, Spinner, type ButtonProps as TButtonProps, type ThemeName } from 'tamagui'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<TButtonProps, 'variant' | 'size' | 'theme'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Affiche un indicateur et bloque l'appui. */
  loading?: boolean
  /** Retour haptique à l'appui (false pour couper). */
  haptic?: HapticKind | false
  fullWidth?: boolean
}

const THEME: Record<ButtonVariant, ThemeName | undefined> = {
  primary: 'brand',
  secondary: undefined,
  outline: undefined,
  ghost: undefined,
  danger: 'destructive',
}
const SHAPE = { outline: 'outlined', ghost: 'quiet' } as const
// hauteurs 36 / 40 / 48 (cible tactile confortable par défaut)
const SIZE = { sm: 'md', md: 'lg', lg: 'xl' } as const

/**
 * @catalog Button
 * @props variant: primary|secondary|outline|ghost|danger · size: sm|md|lg (défaut lg) · loading · icon · iconAfter · fullWidth · haptic
 * @example <Button icon={Plus} loading={create.isPending} onPress={submit}>{t('todos.add')}</Button>
 */
export function Button({
  variant = 'primary',
  size = 'lg',
  loading = false,
  haptic: kind = 'light',
  fullWidth = false,
  disabled,
  icon,
  onPress,
  ...rest
}: ButtonProps) {
  const inactive = Boolean(disabled) || loading
  const shape = variant === 'outline' || variant === 'ghost' ? SHAPE[variant] : undefined
  return (
    <TButton
      theme={THEME[variant]}
      variant={shape}
      size={SIZE[size]}
      rounded="button"
      disabled={inactive}
      opacity={inactive ? 0.6 : 1}
      aria-busy={loading}
      icon={loading ? <Spinner color="color" /> : icon}
      w={fullWidth ? '100%' : undefined}
      scale="1 press:0.97"
      transition="fast"
      onPress={(event) => {
        if (kind) haptic(kind)
        onPress?.(event)
      }}
      {...rest}
    />
  )
}
