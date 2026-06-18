import type { Note, PaginatedData } from '@/types/api'
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api'

export interface CreateNoteData {
  title: string
  content?: string
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  id: number
}

export const getNotes = (params?: {
  page?: number
  limit?: number
  search?: string
  sort?: string
  direction?: string
  paginated?: boolean
}) => {
  return apiGet<PaginatedData<Note> | Array<Note>>('/api/notes', {
    params,
  })
}

export const getNote = (id: number) => {
  return apiGet<Note>(`/api/notes/${id}`)
}

export const createNote = (data: CreateNoteData) => {
  return apiPost<Note>('/api/notes', data)
}

export const updateNote = (id: number, data: Partial<CreateNoteData>) => {
  return apiPatch<Note>(`/api/notes/${id}`, data)
}

export const deleteNote = (id: number) => {
  return apiDelete<void>(`/api/notes/${id}`)
}
