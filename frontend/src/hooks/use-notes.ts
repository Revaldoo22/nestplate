import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { getRouteApi } from '@tanstack/react-router'
import { useAppMutation } from './use-mutations'
import { useExportExcel } from './use-export-excel'
import { useUserPermission } from './use-permissions'
import type { Note, PaginatedData } from '@/types/api'
import type { CreateNoteData } from '@/lib/services/note.service'
import { useDataTable } from '@/components/templates/datatable'
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from '@/lib/services/note.service'
import { getColumns } from '@/components/features/notes/columns'
import { useConfirmation } from '@/hooks/use-confirmation'
import { useNotesUiStore } from '@/lib/stores/notes-ui.store'

const routeApi = getRouteApi('/(content)/notes')

// --- Data Hooks ---

export const useNotes = () => {
  const { page, limit, search, sort, direction } = routeApi.useSearch()

  return useQuery({
    queryKey: ['notes', { page, limit, search, sort, direction }],
    queryFn: () =>
      getNotes({
        page: page || 1,
        limit: limit || 10,
        search: search || '',
        sort: sort || 'createdAt',
        direction: direction || 'desc',
        paginated: true,
      }) as Promise<PaginatedData<Note>>,
    placeholderData: keepPreviousData,
  })
}

// --- Page Hook ---

export const useNotePage = () => {
  const tableState = useDataTable(routeApi)
  const { data, isLoading } = useNotes()
  const { hasPermission } = useUserPermission()
  const { confirm } = useConfirmation()

  const ui = useNotesUiStore(
    useShallow((s) => ({
      open: s.open,
      close: s.close,
      onOpenChange: s.onOpenChange,
      isReadOnly: s.isReadOnly,
      formOpen: s.modals.form.isOpen,
      formEntity: s.modals.form.entity,
    })),
  )
  const editingNote = ui.formEntity

  // Mutations
  const createMutation = useAppMutation({
    mutationFn: createNote,
    invalidateKeys: ['notes'],
    successMessage: 'Note created successfully',
    onSuccess: () => ui.close('form'),
  })

  const updateMutation = useAppMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateNoteData>) =>
      updateNote(id, data),
    invalidateKeys: ['notes'],
    successMessage: 'Note updated successfully',
    onSuccess: () => ui.close('form'),
  })

  const deleteMutation = useAppMutation({
    mutationFn: deleteNote,
    invalidateKeys: ['notes'],
    successMessage: 'Note deleted successfully',
  })

  // Handlers
  const handleCreate = () => ui.open('form', null)

  const handleView = (note: Note) => ui.open('form', note, { readOnly: true })

  const handleEdit = (note: Note) => ui.open('form', note)

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure?',
      color: 'danger',
    })
    if (isConfirmed) deleteMutation.mutate(id)
  }

  const onSubmit = (formData: CreateNoteData) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const columns = getColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    hasPermission,
  })

  const { onExport, isExporting } = useExportExcel({
    filename: 'Notes',
    sheetName: 'Notes',
    columns,
    fetchAll: async () => {
      const res = await getNotes({ paginated: false })
      return Array.isArray(res) ? res : res?.data || []
    },
  })

  return {
    tableProps: {
      data,
      columns,
      isLoading,
      onCreate: handleCreate,
      onExport,
      isExporting,
      ...tableState,
      initialSearch: tableState.search,
    },
    modalProps: {
      isOpen: ui.formOpen,
      onOpenChange: ui.onOpenChange('form'),
      editingNote,
      onSubmit,
      isLoading: createMutation.isPending || updateMutation.isPending,
      isReadOnly: ui.isReadOnly,
    },
  }
}
