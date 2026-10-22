import { Input as TInput, type InputProps as TInputProps } from 'tamagui'

export type InputProps = Omit<TInputProps, 'size'> & {
  /** Bordure d'erreur (géré par FormField). */
  invalid?: boolean
}

/**
 * @catalog Input
 * @props value · onChangeText · placeholder · invalid · secureTextEntry · keyboardType · autoComplete
 * @example <Input value={query} onChangeText={setQuery} placeholder={t('search.placeholder')} />
 */
export function Input({ invalid = false, ...rest }: InputProps) {
  return (
    <TInput
      size="xl"
      px="4"
      rounded="input"
      bg="card"
      borderWidth={1}
      borderColor={invalid ? 'red-500' : 'border-color focus:brand-500'}
      color="color"
      placeholderTextColor="placeholder-color"
      aria-invalid={invalid}
      {...rest}
    />
  )
}
