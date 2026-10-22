import { memo, type JSX } from 'react'
import { Svg, Path, type SvgProps } from 'react-native-svg'
import { themed, type IconProps } from '@tamagui/helpers-icon'

export const Coffee: (props: IconProps) => JSX.Element = themed(
  memo(function Coffee(props: IconProps) {
    const { color = 'black', size = 24, ...otherProps } = props as SvgProps & {
      color?: string
      size?: number
    }
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...otherProps}
      >
        <Path d="M10 2v2" stroke={color} />
        <Path d="M14 2v2" stroke={color} />
        <Path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" stroke={color} />
        <Path d="M6 2v2" stroke={color} />
      </Svg>
    )
  })
)
