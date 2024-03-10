import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { pinecone } from '@/app/_utils/pinecone-client';
import { NextRequest } from 'next/server';
import { createClient } from '@/app/_utils/supabase/server';


/* Environment variables for Pinecone configuration */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;
const ALLOWLIST = process.env.ALLOWLIST as string;

/* Function to handle POST request for document processing */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if(!data.user?.email || !ALLOWLIST.includes(data?.user?.email)) {
    return new Response("You don't have a permission to use this endpoint", {
      status: 400,
    });
  }
  try {
    /* Extracting file from the request's form data */
    const formData = await request.formData();
    const uploadedFile = formData.get('file') as File;
    if (!uploadedFile) {
      throw "Uploaded file couldn't find";
    }
    const fileBuffer = (await uploadedFile.arrayBuffer()) as Buffer;
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
      pinecone.Index(PINECONE_INDEX_NAME); /* Change to your own index name */

    /* Embed the PDF documents */
    await PineconeStore.fromDocuments(documentChunks, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    /* Returning the processed document chunks in JSON format */
    return Response.json({ message: 'Success', success: true, documentChunks });
  } catch (error: any) {
    /* Handling errors during document processing */
    return new Response(`Storing document error: ${error.message}`, {
      status: 400,
    });
  }
}
