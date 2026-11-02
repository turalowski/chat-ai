'use server'

import { deleteVectorsByDocumentPath } from '@/app/_utils/pinecone-vectors'
import { createClient } from '@/app/_utils/supabase/server'

export async function getDocuments() {
  const { data, error } = await createClient()
    .from('documents')
    .select('name, id, path')
    .returns<{ name: string; id: number; path: string }[]>()

  if (error) {
    throw error
  }

  return data ?? []
}

export async function deleteDocument(id: number) {
  const supabase = createClient()

  /* RLS only deletes and returns the row if it's the user's, which gates the Pinecone call below */
  const { data: document, error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .select('path')
    .returns<{ path: string }[]>()
    .maybeSingle()

  if (error) {
    throw error
  }
  if (!document) {
    throw new Error('Document not found')
  }

  await deleteVectorsByDocumentPath(document.path)

  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.path])

  if (storageError) {
    throw storageError
  }
}
