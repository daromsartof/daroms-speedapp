// Mock minimal de react-native-reanimated 4 pour Jest (le runtime natif n'existe pas).
const React = require('react')
const { View, Text, Image, ScrollView } = require('react-native')

const identity = (value) => value
const sharedValue = (initial) => {
  const ref = { value: initial }
  ref.get = () => ref.value
  ref.set = (next) => {
    ref.value = typeof next === 'function' ? next(ref.value) : next
  }
  return ref
}
const createAnimatedComponent = (Component) =>
  React.forwardRef((props, ref) => React.createElement(Component, { ...props, ref }))

const Animated = { View, Text, Image, ScrollView, createAnimatedComponent }
const builder = new Proxy(function () {}, { get: () => builder, apply: () => builder })

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue: (initial) => React.useMemo(() => sharedValue(initial), []),
  useDerivedValue: (fn) => sharedValue(fn()),
  useAnimatedStyle: (fn) => fn(),
  useAnimatedProps: (fn) => fn(),
  useAnimatedReaction: () => undefined,
  useAnimatedRef: () => React.useRef(null),
  useAnimatedScrollHandler: () => () => undefined,
  useReducedMotion: () => false,
  withTiming: identity,
  withSpring: identity,
  withDelay: (_delay, value) => value,
  withRepeat: identity,
  withSequence: (...values) => values[values.length - 1],
  cancelAnimation: () => undefined,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  interpolate: (value) => value,
  interpolateColor: (_value, _input, output) => output[0],
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: new Proxy({}, { get: () => identity }),
  FadeIn: builder,
  FadeOut: builder,
  FadeInDown: builder,
  FadeInUp: builder,
  Layout: builder,
  LinearTransition: builder,
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
}
