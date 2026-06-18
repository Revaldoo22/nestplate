import { createCrudModalStore } from './create-crud-modal-store'
import type { Note } from '@/types/api'

/**
 * UI state for the Notes page modals:
 * - `form` — create / view / edit note (react-hook-form inside)
 */
export const useNotesUiStore = createCrudModalStore<Note>(['form'])
