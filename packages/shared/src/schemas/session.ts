import { z } from 'zod'

export const sessionStatusSchema = z.enum(['running', 'ready', 'idle', 'off', 'done'])

export type SessionStatus = z.infer<typeof sessionStatusSchema>

export const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  categoryId: z.string(),
  status: sessionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Session = z.infer<typeof sessionSchema>
