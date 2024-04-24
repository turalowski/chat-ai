'use client'

import { useRouter } from 'next/navigation'
import { deleteDocument } from '../_actions/documents'
import { TrashIcon } from './icons'
import { toast } from './ui/use-toast'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Spinner } from './spinner'

interface DeleteProps extends React.HTMLAttributes<HTMLElement> {
    document_id: string
}

export function Delete({ document_id, ...props }: DeleteProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const onClick = async () => {
        try {
            startTransition(async () => {
                await deleteDocument(document_id)
                router.refresh()
                toast({
                    title: 'Selected file has been deleted',
                })
            })
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    title: 'error.message',
                })
            }
        }
    }

    return isPending ? (
        <Spinner size="small" />
    ) : (
        <TrashIcon
            className={`hover:cursor-pointer ${isPending && 'fill-gray'}`}
            onClick={onClick}
        />
    )
}
