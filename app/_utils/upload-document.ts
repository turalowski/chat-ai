import { v4 } from 'uuid'
import { createClient } from './supabase/client'

/* Stores the file under the user's folder, as storeDocumentVectors requires. */
export async function uploadDocument(file: File) {
  const client = createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    throw new Error('You must be signed in.')
  }

  const { data, error } = await client.storage
    .from('documents')
    .upload(`${user.id}/${v4()}`, file)

  if (error) {
    console.error('Failed to store the document in Supabase Filestore', error)
    throw error
  }

  return data.path
}
