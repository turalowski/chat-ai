'use server'

import { createClient } from '../_utils/supabase/server'

export async function addGroup(groupName: string, documentPaths: string[]) {
  const { error } = await createClient()
    .from('document_groups')
    .insert([{ document_paths: documentPaths, name: groupName }])

  if (error) {
    throw error
  }
}

export async function getGroups() {
  const { data, error } = await createClient()
    .from('document_groups')
    .select()
    .returns<
      { id: number; name: string; document_paths: string[]; user_id: string }[]
    >()

  if (error) {
    throw error
  }

  return data ?? []
}

export async function deleteGroup(id: string) {
  const { error } = await createClient()
    .from('document_groups')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
