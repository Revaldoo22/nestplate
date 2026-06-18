import { z } from 'zod'

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

export type NoteFormData = z.infer<typeof noteSchema>

export const noteSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).optional(),
})

export type NoteSearchParams = z.infer<typeof noteSearchSchema>
