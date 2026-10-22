import { memo, type JSX } from 'react'
import { Svg, Path, Rect, type SvgProps } from 'react-native-svg'
import { themed, type IconProps } from '@tamagui/helpers-icon'

export const Notebook: (props: IconProps) => JSX.Element = themed(
  memo(function Notebook(props: IconProps) {
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
        <Path d="M2 6h4" stroke={color} />
        <Path d="M2 10h4" stroke={color} />
        <Path d="M2 14h4" stroke={color} />
        <Path d="M2 18h4" stroke={color} />
        <Rect width="16" height="20" x="4" y="2" rx="2" stroke={color} />
        <Path d="M16 2v20" stroke={color} />
      </Svg>
    )
  })
)
