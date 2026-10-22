import { memo, type JSX } from 'react'
import { Svg, Line, Path, Rect, type SvgProps } from 'react-native-svg'
import { themed, type IconProps } from '@tamagui/helpers-icon'

export const CreditCard: (props: IconProps) => JSX.Element = themed(
  memo(function CreditCard(props: IconProps) {
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
        <Rect width="20" height="14" x="2" y="5" rx="2" stroke={color} />
        <Line x1="2" x2="22" y1="10" y2="10" stroke={color} />
        <Path d="M6 14h2" stroke={color} />
      </Svg>
    )
  })
)
