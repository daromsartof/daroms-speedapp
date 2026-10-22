import type { IconComponent } from '../icons'
import { Button, type ButtonProps } from './Button'

const SQUARE = { sm: '9', md: '10', lg: '12' } as const

export type IconButtonProps = Omit<ButtonProps, 'children' | 'icon' | 'iconAfter'> & {
  icon: IconComponent
  /** Libellé lu par les lecteurs d'écran (obligatoire). */
  label: string
}

/**
 * @catalog IconButton
 * @props icon (requis) · label (requis, a11y) · variant (défaut ghost) · size: sm|md|lg
 * @example <IconButton icon={Settings} label={t('settings.title')} onPress={open} />
 */
export function IconButton({ icon, label, variant = 'ghost', size = 'md', ...rest }: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      aria-label={label}
      w={SQUARE[size]}
      h={SQUARE[size]}
      p="0"
      rounded="pill"
      haptic="selection"
      {...rest}
    />
  )
}
