'use client'

import { FilePlus } from 'lucide-react'

import { Input } from './ui/input'
import { Label } from './ui/label'
import { useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReloadIcon } from '@radix-ui/react-icons'
import { uploadDocument } from '../_utils/upload-document'
import { storeDocumentVectors } from '../_actions/pinecone'
import { toast } from './ui/use-toast'

interface CheckboxEvent extends React.ChangeEvent<HTMLInputElement> {}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  documents: {
    name: string
    id: number
    path: string
  }[]
}

export function AddFile({ className, ...props }: SidebarNavProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  async function handleUploadClick(file: File) {
    startTransition(async () => {
      // Check if a file is selected
      if (!file) {
        throw new Error('You need to upload a file first')
      }
      try {
        /* Upload document to Supabase Storage */
        const documentPath = await uploadDocument(file)
        // Split document into chunks, store in supabase table and pinecone database
        await storeDocumentVectors(documentPath, file.name)
        // Update URL parameters with document ID
        const params = new URLSearchParams(
          searchParams as unknown as URLSearchParams
        )
        params.set('document_id', documentPath)
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        })
        // Display success message
        toast({
          title: 'File has been uploaded',
        })
      } catch (error: any) {
        // Display error message
        toast({
          title: error.message,
        })
      }
    })
  }

  return (
    <>
      {' '}
      <Input
        id="file"
        className="hidden"
        type="file"
        value={undefined}
        accept="application/pdf"
        onChange={(event) => {
          const file = event?.target?.files?.[0]
          if (file) {
            handleUploadClick(file)
          }
        }}
      />
      <Label
        htmlFor="file"
        className="h-8 w-8 border flex items-center justify-center rounded hover:cursor-pointer"
      >
        {isPending ? (
          <ReloadIcon className="h-4 w-4 animate-spin" />
        ) : (
          <FilePlus className="h-4 w-4" size={16} />
        )}
      </Label>
    </>
  )
}
