import { Tooltip } from '@heroui/react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Column } from '@/components/templates/datatable'
import type { Note } from '@/types/api'

interface GetColumnsParams {
  onView: (note: Note) => void
  onEdit: (note: Note) => void
  onDelete: (id: number) => void
  hasPermission: (permission: string) => boolean
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
  hasPermission,
}: GetColumnsParams): Array<Column<Note>> => [
  { name: 'ID', uid: 'id', sortable: true },
  { name: 'Title', uid: 'title', sortable: true, truncate: true, maxWidth: 220 },
  {
    name: 'Content',
    uid: 'content',
    sortable: true,
    truncate: true,
    maxWidth: 320,
  },
  {
    name: 'Created At',
    uid: 'createdAt',
    sortable: true,
    render: (item) => format(item.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    exportValue: (item) => format(item.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    name: 'Actions',
    uid: 'actions',
    render: (item) => (
      <div className="relative flex items-center gap-2">
        {hasPermission('notes.read') && (
          <Tooltip content="View details">
            <span
              className="text-lg text-default-400 cursor-pointer active:opacity-50"
              onClick={() => onView(item)}
            >
              <Eye size={16} />
            </span>
          </Tooltip>
        )}
        {hasPermission('notes.update') && (
          <Tooltip content="Edit note">
            <span
              className="text-lg text-default-400 cursor-pointer active:opacity-50"
              onClick={() => onEdit(item)}
            >
              <Pencil size={16} />
            </span>
          </Tooltip>
        )}
        {hasPermission('notes.delete') && (
          <Tooltip color="danger" content="Delete note">
            <span
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={16} />
            </span>
          </Tooltip>
        )}
      </div>
    ),
  },
]
