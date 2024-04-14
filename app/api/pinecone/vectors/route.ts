import { pinecone } from '@/utils/pinecone-client';
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

/* Environment variables for Pinecone configuration */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;
const ALLOWLIST = process.env.ALLOWLIST as string;

/* Function to handle Delete request for document processing */
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if(!data.user?.email || !ALLOWLIST.includes(data?.user?.email)) {
    return new Response("You don't have a permission to use this endpoint", {
      status: 400,
    });
  }
  try {
    const index =
      pinecone.Index(PINECONE_INDEX_NAME); /* Change to your own index name */
    await index.namespace(PINECONE_NAME_SPACE).deleteAll();
    /* Returning the processed document chunks in JSON format */
    return Response.json({ message: 'Success', success: true });
  } catch (error: any) {
    if (error.name === 'PineconeNotFoundError') {
      return Response.json({ message: 'Success', success: true });
    }
    /* Handling errors during document processing */
    return new Response(`Deleting vectors error: ${error.message}`, {
      status: 400,
    });
  }
}
