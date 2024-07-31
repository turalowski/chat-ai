'use client'

import { useRef } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { SendHorizonalIcon } from 'lucide-react'
import { useAppContext } from '@/app/_context/Chat'
import { useSearchParams } from 'next/navigation'
import useChat from '../_hooks/useChat'

export default function NewMessage() {
  const { query, setQuery, loading } = useAppContext()
  const { handleSubmit } = useChat()
  const searchParams = useSearchParams()

  const params = new URLSearchParams(searchParams as unknown as URLSearchParams)

  const selectedDocumentPath = params.get('document_id')
  const groupId = params.get('group_id')

  const textAreaRef = useRef<HTMLInputElement>(null)

  return (
    <form className="w-full flex gap-3" onSubmit={handleSubmit}>
      <Input
        disabled={loading}
        className="w-full"
        ref={textAreaRef}
        autoFocus={false}
        maxLength={512}
        id="userInput"
        name="userInput"
        placeholder={
          loading ? 'Waiting for response...' : 'Describe this document.'
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        disabled={loading || (!selectedDocumentPath && !groupId)}
      >
        {loading ? (
          <ReloadIcon className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonalIcon className=" h-4 w-4" />
        )}
      </Button>
    </form>
  )
}
