import { memo, type JSX } from 'react'
import { Svg, Path, type SvgProps } from 'react-native-svg'
import { themed, type IconProps } from '@tamagui/helpers-icon'

export const TrendingUp: (props: IconProps) => JSX.Element = themed(
  memo(function TrendingUp(props: IconProps) {
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
        <Path d="M16 7h6v6" stroke={color} />
        <Path d="m22 7-8.5 8.5-5-5L2 17" stroke={color} />
      </Svg>
    )
  })
)
