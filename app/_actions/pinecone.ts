'use server'

import { createClient } from '@/app/_utils/supabase/server'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { Pinecone } from '@pinecone-database/pinecone'

/* Environment variables for Pinecone configuration */
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string

/* Function to handle POST request for document processing */
export async function storeDocumentVectors(
  documentPath: string,
  documentName: string
) {
  var startTime = new Date().getTime()
  try {
    // Create a Supabase client instance
    const client = createClient()
    /* Get uploaded document from supabase storage. RLS only allows the user's own files */
    const { data: documentAsBlob, error: documentError } = await client.storage
      .from('documents')
      .download(documentPath)
    // Throw if there is an error
    if (documentError) {
      throw documentError
    }
    // Throw if document is missing
    if (!documentAsBlob) {
      throw new Error('Failed to find document')
    }
    // Initialize Pinecone client with API key
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
    })
    // Extract file from the request's form data
    const fileBuffer = (await documentAsBlob.arrayBuffer()) as Buffer
    const fileBlob = new Blob([
      fileBuffer,
    ]) /* Creating a Blob from the Buffer for PDF loading */
    /* Loading and processing PDF document */
    const pdfLoader = new PDFLoader(fileBlob)
    let pdfDocument = await pdfLoader.load()
    /* Normalize the page content by replacing newline characters with spaces */
    pdfDocument = pdfDocument.map((page, index) => ({
      ...page,
      pageContent: page.pageContent.replaceAll('\n', ' '),
      metadata: {
        ...page.metadata,
        pageNumber: index + 1, // Add page number to metadata
      },
    }))
    /* Splitting document text into smaller chunks for processing */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000 /* Maximum size of each text chunk */,
      chunkOverlap: 200 /* Characters to overlap between chunks for */,
    })
    /* Applying the text splitter to the processed PDF document */
    const documentChunks = await textSplitter.splitDocuments(pdfDocument)
    /* Create and store the embeddings in the vectorStore */
    const embeddings = new OpenAIEmbeddings()
    const index =
      pinecone.index(PINECONE_INDEX_NAME) /* Change to your own index name */
    /* Embed the PDF documents and collect vector IDs */
    const itemsToUpsert = []
    // Embed the PDF documents and collect vector IDs
    const readyEmbeddings = await embeddings.embedDocuments(
      documentChunks.map((documentChunk) => documentChunk.pageContent)
    )

    // Create vector items to upsert
    for (const [index, chunk] of documentChunks.entries()) {
      const vectorId = `${documentPath}#chunk${index}`
      itemsToUpsert.push({
        id: vectorId,
        values: readyEmbeddings[index],
        metadata: {
          ...chunk.metadata.pdf.info,
          pageNumber: chunk.metadata.pageNumber,
          text: chunk.pageContent,
          documentPath: documentPath,
        },
      })
    }
    // Define a function to upsert items in batches
    async function upsertInBatches(items: any[], batchSize: number) {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        await index.upsert(batch)
      }
    }
    // Call the function with your items and batch size
    const batchSize = 100
    await upsertInBatches(itemsToUpsert, batchSize)
    // Add document to database and update user documents
    const { error: insertError } = await client
      .from('documents')
      .insert([{ path: documentPath, name: documentName }])
    if (insertError) {
      throw insertError
    }
    // Return success message
    return {
      message: 'Success',
      success: true,
    }
  } catch (error: any) {
    // Log and throw storing document error
    console.error(`Storing document error: ${error.message}`)
    throw error
  }
}
