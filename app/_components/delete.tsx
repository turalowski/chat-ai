'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { deleteDocument } from '../_actions/documents'
import { toast } from './ui/use-toast'
import { MouseEventHandler, useTransition } from 'react'
import { Spinner } from './spinner'
import { TrashIcon } from 'lucide-react'
interface DeleteProps extends React.HTMLAttributes<HTMLElement> {
  documentId: number
  documentPath: string
  isFileLoading: boolean
}

export function Delete({
  isFileLoading,
  documentId,
  documentPath,
}: DeleteProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const params = new URLSearchParams(searchParams as unknown as URLSearchParams)

  const selectedDocumentPath = params.get('document_id')

  const onClick: MouseEventHandler<SVGGElement> = async (event) => {
    event.stopPropagation()
    if (isFileLoading) {
      return
    }
    try {
      startTransition(async () => {
        await deleteDocument(documentId)
        if (selectedDocumentPath === documentPath) {
          params.delete('document_id')
          router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
          })
        } else {
          router.refresh()
        }
        toast({
          title: 'Selected file has been deleted',
        })
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Delete document error: ', error.message)
        toast({
          title: 'Failed to delete the document',
        })
      }
    }
  }

  return (
    <div>
      {isPending ? (
        <Spinner size="small" />
      ) : (
        <TrashIcon
          size={14}
          className="hover:cursor-pointer"
          onClick={onClick}
          color="red"
        />
      )}
    </div>
  )
}
