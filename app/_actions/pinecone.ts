'use server'

import { createClient } from '@/app/_utils/supabase/server'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { Pinecone } from '@pinecone-database/pinecone'

/* Environment variables for Pinecone configuration */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string
const ALLOWLIST = process.env.ALLOWLIST as string

/* Function to handle Delete request for document processing */
export const flushVectorialDatabase = async () => {
    const client = createClient()
    const { data } = await client.auth.getUser()
    if (!data.user?.email || !ALLOWLIST.includes(data?.user?.email)) {
        throw new Error(
            "You don't have a permission to flush vectorial database"
        )
    }
    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY as string,
        })
        const index =
            pinecone.Index(
                PINECONE_INDEX_NAME
            ) /* Change to your own index name */
        await index.namespace(PINECONE_NAME_SPACE).deleteAll()
        /* Returning the processed document chunks in JSON format */
        return {
            message: 'Success',
            success: true,
        }
    } catch (error: any) {
        if (error.name === 'PineconeNotFoundError') {
            return { message: 'Success', success: true }
        }
        /* Handling errors during document processing */
        console.error(`Deleting vectors error: ${error.message}`)
        throw error
    }
}

/* Function to handle POST request for document processing */
export async function storeDocumentVectors(documentPath: string) {
    const client = createClient()
    const { data: userData } = await client.auth.getUser()
    if (!userData.user?.email || !ALLOWLIST.includes(userData.user?.email)) {
        throw new Error(
            "You don't have a permission to flush vectorial database"
        )
    }
    /* Get uploaded document from supabase storage */
    const { data, error } = await client.storage
        .from('documents')
        .download(documentPath)

    if (!data) {
        throw new Error('Failed to find document')
    }
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY as string,
    })
    try {
        /* Extracting file from the request's form data */
        if (!data) {
            throw new Error("Uploaded file couldn't find")
        }
        const fileBuffer = (await data.arrayBuffer()) as Buffer
        const fileBlob = new Blob([
            fileBuffer,
        ]) /* Creating a Blob from the Buffer for PDF loading */
        /* Loading and processing PDF document */
        const pdfLoader = new PDFLoader(fileBlob)
        let pdfDocument = await pdfLoader.load()
        /* Normalize the page content by replacing newline characters with spaces */
        pdfDocument = pdfDocument.map((page) => ({
            ...page,
            pageContent: page.pageContent.replaceAll('\n', ' '),
        }))
        /* Splitting document text into smaller chunks for processing */
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000 /* Maximum size of each text chunk */,
            chunkOverlap: 200 /* Characters to overlap between chunks for context preservation */,
        })
        /* Applying the text splitter to the processed PDF document */
        const documentChunks = await textSplitter.splitDocuments(pdfDocument)

        /* Create and store the embeddings in the vectorStore */
        const embeddings = new OpenAIEmbeddings()
        const index =
            pinecone.Index(
                PINECONE_INDEX_NAME
            ) /* Change to your own index name */

        /* Embed the PDF documents */
        await PineconeStore.fromDocuments(documentChunks, embeddings, {
            pineconeIndex: index,
            namespace: PINECONE_NAME_SPACE,
            textKey: 'text',
        })

        return {
            message: 'Success',
            success: true,
            documentChunks: JSON.stringify(documentChunks),
        }
    } catch (error: any) {
        console.error(`Storing document error: ${error.message}`)
        throw error
    }
}
