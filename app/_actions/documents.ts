'use server';

import { createClient } from '@/app/_utils/supabase/server';
import { Document as DocumentType } from '../_lib/types';

export const updateUserDocuments = async (
  documentPath: string,
  documentName: string
): Promise<void> => {
  try {
    const client = createClient();

    /* Retrieve a user */
    const {
      data: { user },
    } = await client.auth.getUser();

    if (user) {
      /* Insert file id user id to a user_files table */
      const { data, error } = await client
        .from('user_files')
        .insert([
          { document_id: documentPath, user_id: user.id, name: documentName },
        ]);

      if (error) {
        throw error;
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('updateUserDocuments ', error.message);
      throw new Error('Failed to store the file in database');
    }
  }
};

export async function getDocuments() {
  const supabase = createClient();
  /* Retrieve a user */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('user_files')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }
    return data as unknown as DocumentType[];
  }
}

export async function deleteDocument(id: string) {
  const supabase = createClient();
  /* Delete the file from user_files table */
  const { error: tableError } = await supabase
    .from('user_files')
    .delete()
    .eq('document_id', id);

  if (tableError) {
    console.log(
      'Error deleting item from user files table:',
      tableError.message
    );
    throw tableError;
  }

  /* Delete the file from "documents" storage bucket */
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([id]);
  if (storageError) {
    console.log('Error deleting item from storage:', storageError.message);
    throw storageError;
  }
}

