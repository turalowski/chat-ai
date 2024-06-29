'use server';

import { createClient } from '@/app/_utils/supabase/server';
import { deleteVectorsByDocumentPath } from './pinecone';

export const addDocumentToDatabse = async (
  path: string,
  name: string
): Promise<number> => {
  try {
    const client = createClient();

    /* Retrieve a user */
    const {
      data: { user },
    } = await client.auth.getUser();

    if (user) {
      /* Insert file id user id to a user_files table */
      const { data, error } = await client
        .from('documents')
        .insert([{ path, name, user_id: user.id }])
        .select();

      if (error) {
        throw error;
      }

      const documentId = data![0].id as number;
      return documentId;
    } else {
      throw new Error('User information is missing');
    }
  } catch (error: unknown) {
    console.error('updateUserDocuments ', (error as Error).message);
    throw new Error('Failed to store the file in database');
  }
};

export const updateUserDocuments = async (
  documentId: number
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
        .from('user_documents')
        .insert([{ user_id: user.id, document_id: documentId }]);

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
  // Create a client instance for Supabase
  const supabase = createClient();
  // Retrieve the currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If a user is authenticated
  if (user) {
    // Query the 'user_documents' table to select documents where user_id matches the authenticated user's id
    const response = supabase
      .from('user_documents')
      .select('documents(name, id, path)')
      .eq('user_id', user.id)
      .returns<{ documents: { name: string; id: number; path: string } }[]>();
    // Await the response from the query
    const { data, error } = await response;
    // If there is an error, throw the error
    if (error) {
      throw error;
    }
    // If data is returned
    if (data) {
      // Map the data to extract document details
      const documents = data?.map(dataItem => ({
        ...dataItem.documents,
      }));
      // Return the documents array
      return documents;
    } else {
      // If no data is returned, return an empty array
      return [];
    }
  } else {
    throw new Error('User not found')
  }
}

export async function deleteDocument(id: number, path: string) {
  const supabase = createClient();
  await deleteVectorsByDocumentPath(path);

  /* Delete the file from user_files table */
  const { error: tableError } = await supabase
    .from('user_documents')
    .delete()
    .eq('document_id', id);

  await supabase.from('documents').delete().eq('id', id);

  if (tableError) {
    console.error(
      'Error deleting item from user files table:',
      tableError.message
    );
    throw tableError;
  }

  /* Delete the file from "documents" storage bucket */
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([String(path)]);
}
