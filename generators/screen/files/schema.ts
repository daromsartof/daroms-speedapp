import { z } from 'zod'

export const {{Name}}ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
})

export type {{Name}}Item = z.infer<typeof {{Name}}ItemSchema>
