'use server';

import { createClient } from '@/utils/supabase/server';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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
    .insert([
      { document_id: document.id, user_id: user.id, name: name },
    ]);

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
        const result = await updateUserDocuments(supabase, user, document, file.name);
        console.log('result', result)
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}
