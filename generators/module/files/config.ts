import { z } from 'zod'

/** Configuration lue dans manifest.modules.{{slug}}. */
export const {{camel}}Config = z.object({
  enabled: z.boolean().default(true),
})

export type {{Name}}Config = z.infer<typeof {{camel}}Config>
