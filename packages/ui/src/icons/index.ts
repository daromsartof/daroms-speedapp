// Jeu d'icônes unique : Lucide, généré par `tamagui icons add` (voir `daroms icons add`).
import type { IconProps } from '@tamagui/helpers-icon'
import type { JSX } from 'react'

import * as lucide from './lucide'

export * from './lucide'
export type { IconProps }

export type IconComponent = (props: IconProps) => JSX.Element
export type IconName = keyof typeof lucide

/** Recherche d'icône par nom (manifest, données). */
export function getIcon(name: string): IconComponent | undefined {
  return (lucide as Record<string, IconComponent>)[name]
}
