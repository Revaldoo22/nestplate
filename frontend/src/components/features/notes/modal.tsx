import { useEffect } from 'react'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotebookPen } from 'lucide-react'
import type { Note } from '@/types/api'
import type { NoteFormData } from '@/lib/schemas/notes'
import { noteSchema } from '@/lib/schemas/notes'

interface NoteFormModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingNote: Note | null
  onSubmit: (data: NoteFormData) => void
  isLoading?: boolean
  isReadOnly?: boolean
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string
  value?: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 py-3 px-4 rounded-xl bg-default-50 border border-default-100">
      <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-default-700 whitespace-pre-wrap ${mono ? 'font-mono' : ''}`}
      >
        {value || 'N/A'}
      </span>
    </div>
  )
}

export function NoteFormModal({
  isOpen,
  onOpenChange,
  editingNote,
  onSubmit,
  isLoading = false,
  isReadOnly = false,
}: NoteFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  })

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        reset({
          title: editingNote.title,
          content: editingNote.content || '',
        })
      } else {
        reset({ title: '', content: '' })
      }
    }
  }, [isOpen, editingNote, reset])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 items-center">
              <NotebookPen size={20} className="text-primary" />
              <span>
                {isReadOnly
                  ? 'Note Details'
                  : editingNote
                    ? 'Edit Note'
                    : 'Create Note'}
              </span>
            </ModalHeader>

            <ModalBody className="pb-6">
              {isReadOnly ? (
                <div className="flex flex-col gap-4">
                  <DetailRow label="Title" value={editingNote?.title} />
                  <DetailRow
                    label="Content"
                    value={editingNote?.content || 'No content provided'}
                  />
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-default-50 border border-default-100">
                    <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">
                      Internal ID
                    </span>
                    <span className="text-sm font-mono font-bold text-primary">
                      #{editingNote?.id}
                    </span>
                  </div>
                </div>
              ) : (
                <form
                  id="note-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <Input
                    {...register('title')}
                    label="Title"
                    placeholder="e.g. Meeting notes"
                    variant="bordered"
                    labelPlacement="outside"
                    errorMessage={errors.title?.message}
                    isInvalid={!!errors.title}
                  />
                  <Textarea
                    {...register('content')}
                    label="Content"
                    placeholder="Write your note..."
                    variant="bordered"
                    labelPlacement="outside"
                    minRows={4}
                    errorMessage={errors.content?.message}
                    isInvalid={!!errors.content}
                  />
                </form>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose} className="font-medium">
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button
                  color="primary"
                  type="submit"
                  form="note-form"
                  isLoading={isLoading}
                  className="px-8 font-medium"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
