import { memo, type JSX } from 'react'
import { Svg, Path, Rect, type SvgProps } from 'react-native-svg'
import { themed, type IconProps } from '@tamagui/helpers-icon'

export const Mic: (props: IconProps) => JSX.Element = themed(
  memo(function Mic(props: IconProps) {
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
        <Path d="M12 19v3" stroke={color} />
        <Path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={color} />
        <Rect x="9" y="2" width="6" height="13" rx="3" stroke={color} />
      </Svg>
    )
  })
)
