import { zodValidator } from '@tanstack/zod-adapter'
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/templates/datatable'
import { useNotePage } from '@/hooks/use-notes'
import { noteSearchSchema } from '@/lib/schemas/notes'
import { NoteFormModal } from '@/components/features/notes/modal'
import { PageHeader } from '@/components/templates/page-header'
import { TableSkeleton } from '@/components/templates/skeletons'

export const Route = createFileRoute('/(content)/notes')({
  validateSearch: zodValidator(noteSearchSchema),
  component: NotesPage,
})

function NotesPage() {
  const { tableProps, modalProps } = useNotePage()

  return (
    <div>
      <PageHeader
        title="Notes"
        breadcrumbs={[{ label: 'Notes', isCurrent: true }]}
      />

      {tableProps.isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
        <DataTable {...tableProps} />
      )}
      <NoteFormModal {...modalProps} />
    </div>
  )
}

export default NotesPage
