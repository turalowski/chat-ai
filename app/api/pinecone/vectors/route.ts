import { pinecone } from '@/app/_utils/pinecone-client';
import { NextRequest } from 'next/server';

/* Environment variables for Pinecone configuration */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;

/* Function to handle Delete request for document processing */
export async function DELETE(request: NextRequest) {
  try {
    console.log(5);
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
