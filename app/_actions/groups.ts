'use server'

import { createClient } from '../_utils/supabase/server'

export async function addGroup(groupName: string, documentPaths: string[]) {
  // Create a client instance for Supabase
  const supabase = createClient()
  // Retrieve the currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // If a user is authenticated
  if (user) {
    // Query the 'user_documents' table to select documents where user_id matches the authenticated user's id
    const response = supabase
      .from('document_groups')
      .insert([
        { document_paths: documentPaths, user_id: user.id, name: groupName },
      ])
    // Await the response from the query
    const { data, error } = await response
    // If there is an error, throw the error
    if (error) {
      throw error
    }
    // If data is returned
    if (data) {
      // Return the documents array
      return data
    } else {
      // If no data is returned, return an empty array
      return []
    }
  } else {
    throw new Error('User not found')
  }
}

export async function getGroups() {
  // Create a client instance for Supabase
  const supabase = createClient()
  // Retrieve the currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If a user is authenticated
  if (user) {
    // Query the 'user_documents' table to select documents where user_id matches the authenticated user's id
    const response = supabase
      .from('document_groups')
      .select()
      .eq('user_id', user.id)
      .returns<
        { id: number; name: string; docuemnt_ids: string[]; user_id: string }[]
      >()
    // Await the response from the query
    const { data, error } = await response
    // If there is an error, throw the error
    if (error) {
      throw error
    }
    // If data is returned
    if (data) {
      // Return the documents array
      return data
    } else {
      // If no data is returned, return an empty array
      return []
    }
  } else {
    throw new Error('User not found')
  }
}

export async function deleteGroup(id: string) {
  const supabase = createClient()

  /* Delete the file from user_files table */
  const { error: tableError } = await supabase
    .from('document_groups')
    .delete()
    .eq('id', id)

  if (tableError) {
    console.error(
      'Error deleting item from document groups table:',
      tableError.message
    )
    throw tableError
  }
}
