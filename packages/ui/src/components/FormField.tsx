import { useTranslateKey } from '@daroms/i18n'
import { useId } from 'react'
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Label, YStack } from 'tamagui'

import { Input, type InputProps } from './Input'
import { Caption } from './Text'

export type FormFieldProps<T extends FieldValues> = Omit<InputProps, 'value' | 'onChangeText' | 'onBlur' | 'invalid'> & {
  control: Control<T>
  name: Path<T>
  label: string
  hint?: string
}

/**
 * @catalog FormField
 * @props control · name · label · hint · + props Input (secureTextEntry, keyboardType...). Messages zod = clés i18n.
 * @example <FormField control={form.control} name="email" label={t('auth.email')} keyboardType="email-address" />
 */
export function FormField<T extends FieldValues>({ control, name, label, hint, ...input }: FormFieldProps<T>) {
  const { field, fieldState } = useController({ control, name })
  const translate = useTranslateKey()
  const id = useId()
  const error = fieldState.error?.message
  return (
    <YStack gap="tight">
      <Label htmlFor={id} size="sm" color="color-9">
        {label}
      </Label>
      <Input
        id={id}
        value={field.value == null ? '' : String(field.value)}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        invalid={Boolean(error)}
        {...input}
      />
      {error ? <Caption tone="danger">{translate(error)}</Caption> : hint ? <Caption>{hint}</Caption> : null}
    </YStack>
  )
}
