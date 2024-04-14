'use server';

import { createClient } from '@/app/_utils/supabase/server';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { Document as DocumentType } from '../_lib/types';

type Document = {
  id: string;
  fullPath: string;
  path: string;
};

const uploadFile = async (client: SupabaseClient, file: File) => {
  /* Upload a file */
  const { data, error } = await client.storage
    .from('documents')
    .upload(randomUUID(), file);
  if (error) {
    throw new Error(error.message);
  }
  return data as unknown as Document;
};

const updateUserDocuments = async (
  client: SupabaseClient,
  user: User,
  document: Document,
  name: string
) => {
  /* Insert file id user id to a user_files table */
  const { data, error } = await client
    .from('user_files')
    .insert([{ document_id: document.path, user_id: user.id, name: name }]);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export async function postDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (file) {
      const supabase = createClient();
      const document = await uploadFile(supabase, file);
      /* Retrieve a user */
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && document) {
        console.log('document', document);
        await updateUserDocuments(supabase, user, document, file.name);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error('Failed to store the file in database');
    }
  }
}

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
