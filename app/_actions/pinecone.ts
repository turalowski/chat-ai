'use server';

import { createClient } from '@/app/_utils/supabase/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { Pinecone } from '@pinecone-database/pinecone';
import { addDocumentToDatabse, updateUserDocuments } from './documents';

/* Environment variables for Pinecone configuration */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;
const ALLOWLIST = process.env.ALLOWLIST as string;

/* Function to handle Delete request for document processing */
export const flushPineconeIndex = async () => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
    });
    const index =
      pinecone.Index(PINECONE_INDEX_NAME); /* Change to your own index name */
    await index.namespace(PINECONE_NAME_SPACE).deleteAll();
    /* Returning the processed document chunks in JSON format */
    return {
      message: 'Success',
      success: true,
    };
  } catch (error: any) {
    if (error.name === 'PineconeNotFoundError') {
      return { message: 'Success', success: true };
    }
    /* Handling errors during document processing */
    console.error(`Deleting vectors error: ${error.message}`);
    throw error;
  }
};

/* Function to handle Delete request for document processing */
export const deleteVectorsByDocumentPath = async (path: string) => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
    });
    const index =
      pinecone.index(PINECONE_INDEX_NAME); /* Change to your own index name */

    let paginationToken = undefined;
    do {
      const results = await index.listPaginated({
        prefix: `${path}#`,
        paginationToken,
      });
      const vectors = results.vectors
        ?.filter(vector => vector !== undefined)
        .map(vector => vector?.id);

      if (vectors?.length) {
        await index.deleteMany(vectors);
      }
      if (results.pagination?.next) {
        paginationToken = results.pagination?.next;
      } else {
        break;
      }
    } while (paginationToken);
    /* Returning the processed document chunks in JSON format */
    return {
      message: 'Success',
      success: true,
    };
  } catch (error: any) {
    if (error.name === 'PineconeNotFoundError') {
      return { message: 'Success', success: true };
    }
    /* Handling errors during document processing */
    console.error(`Deleting vectors error: ${error.message}`);
    throw error;
  }
};

/* Function to handle POST request for document processing */
export async function storeDocumentVectors(
  documentPath: string,
  documentName: string
) {
  const client = createClient();
  const { data: userData } = await client.auth.getUser();
  if (!userData.user?.email || !ALLOWLIST.includes(userData.user?.email)) {
    throw new Error("You don't have a permission to flush vectorial database");
  }
  /* Get uploaded document from supabase storage */
  const { data, error } = await client.storage
    .from('documents')
    .download(documentPath);

  if (!data) {
    throw new Error('Failed to find document');
  }
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });

  try {
    /* Extracting file from the request's form data */
    if (!data) {
      throw new Error("Uploaded file couldn't find");
    }
    const fileBuffer = (await data.arrayBuffer()) as Buffer;
    const fileBlob = new Blob([
      fileBuffer,
    ]); /* Creating a Blob from the Buffer for PDF loading */
    /* Loading and processing PDF document */
    const pdfLoader = new PDFLoader(fileBlob);
    let pdfDocument = await pdfLoader.load();
    /* Normalize the page content by replacing newline characters with spaces */
    pdfDocument = pdfDocument.map(page => ({
      ...page,
      pageContent: page.pageContent.replaceAll('\n', ' '),
    }));
    /* Splitting document text into smaller chunks for processing */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000 /* Maximum size of each text chunk */,
      chunkOverlap: 200 /* Characters to overlap between chunks for context preservation */,
    });
    /* Applying the text splitter to the processed PDF document */
    const documentChunks = await textSplitter.splitDocuments(pdfDocument);

    /* Create and store the embeddings in the vectorStore */
    const embeddings = new OpenAIEmbeddings();
    const index =
      pinecone.index(PINECONE_INDEX_NAME); /* Change to your own index name */

    /* Embed the PDF documents and collect vector IDs */
    const itemsToUpsert = [];

    const readyEmbeddings = await Promise.all(
      documentChunks.map(
        async documentChunk =>
          await embeddings.embedQuery(documentChunk.pageContent)
      )
    );

    for (const [index, chunk] of documentChunks.entries()) {
      const vectorId = `${documentPath}#chunk${index}`;
      itemsToUpsert.push({
        id: vectorId,
        values: readyEmbeddings[index],
        metadata: {
          ...chunk.metadata.pdf.info,
          text: chunk.pageContent,
          documentPath: documentPath,
        },
      });
    }

    // Define a function to upsert items in batches
    async function upsertInBatches(items: any[], batchSize: number) {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await index.upsert(batch);
      }
    }

    // Call the function with your items and batch size
    const batchSize = 100;
    await upsertInBatches(itemsToUpsert, batchSize);

    const documentId = await addDocumentToDatabse(documentPath, documentName);
    await updateUserDocuments(documentId);

    return {
      message: 'Success',
      success: true,
    };
  } catch (error: any) {
    console.error(`Storing document error: ${error.message}`);
    throw error;
  }
}
