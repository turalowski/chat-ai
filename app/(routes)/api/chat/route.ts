import type { Document } from 'langchain/document'
import { PineconeStore } from '@langchain/pinecone'
import { z } from 'zod'
import { VoyageEmbeddings } from '@/app/_utils/embeddings'
import { makeChain } from '@/app/_utils/makechain'
import { pinecone } from '@/app/_utils/pinecone-client'
import { createClient } from '@/app/_utils/supabase/server'

/* Retrieve Pinecone configurations from environment variables */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string


const bodySchema = z
  .object({
    question: z.string().trim().min(1).max(4000),
    history: z.array(z.tuple([z.string(), z.string()])).max(500),
    documentPath: z.string().max(200).nullish(),
    groupId: z.string().max(64).nullish(),
  })
  .refine(({ documentPath, groupId }) => documentPath || groupId, {
    message: 'Select a document or group first.',
  })

export async function POST(req: Request) {
  try {
    const supabase = createClient()

    const body = bodySchema.safeParse(await req.json().catch(() => null))
    if (!body.success) {
      return Response.json(
        { error: body.error.issues[0].message },
        { status: 400 }
      )
    }
    const { question, history, documentPath, groupId } = body.data

    /* Sanitize the question by replacing newlines with spaces */
    const sanitizedQuestion = question.replaceAll('\n', ' ')
    /* Initialize the Pinecone index with the given index name */
    const index = pinecone.Index(PINECONE_INDEX_NAME)

    let requestedPaths = documentPath ? [documentPath] : []

    if (groupId) {
      const { data: group, error } = await supabase
        .from('document_groups')
        .select('document_paths')
        .eq('id', groupId)
        .returns<{ document_paths: string[] }[]>()
        .maybeSingle()

      if (error) {
        throw error
      }
      requestedPaths = group?.document_paths ?? []
    }

    /* Pinecone has no RLS, so only search the paths that RLS lets this user see in the database */
    const { data: visibleDocuments, error: documentsError } = await supabase
      .from('documents')
      .select('path')
      .in('path', requestedPaths)
      .returns<{ path: string }[]>()

    if (documentsError) {
      throw documentsError
    }

    const documentPaths = (visibleDocuments ?? []).map(({ path }) => path)

    if (documentPaths.length === 0) {
      return Response.json({ error: 'Document not found.' }, { status: 404 })
    }

    /* Connect to the Pinecone vector store with the specified index, embedding model, and configurations */
    const vectorStore = await PineconeStore.fromExistingIndex(
      new VoyageEmbeddings(),
      {
        pineconeIndex: index,
        textKey: 'text',
        filter: {
          documentPath: {
            $in: documentPaths,
          },
        },
        namespace:
          PINECONE_NAME_SPACE /* The namespace is configured in your environment or config folder */,
      }
    )
    /* Promise setup to handle asynchronous retrieval of documents */
    let resolveWithDocuments: (value: Document[]) => void
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve
    })
    /* Setup the retriever with a callback to process documents at the end of retrieval */
    const retriever = vectorStore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents)
          },
        },
      ],
    })
    /* Create a processing chain with the configured retriever */
    const chain = makeChain(retriever)
    /* Prepare the chat history for the chain by formatting the messages */
    const pastMessages = history
      .map((message) => {
        return [`Human: ${message[0]}`, `Assistant: ${message[1]}`].join('\n')
      })
      .join('\n')
    /* Invoke the chain with the sanitized question and prepared chat history */
    const response = await chain.invoke({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    })
    /* Await the resolution of document retrieval */
    const sourceDocuments = await documentPromise
    /* Return the response along with source documents with a 200 status code */
    return Response.json(
      { text: response, sourceDocuments: JSON.stringify(sourceDocuments) },
      {
        status: 200,
      }
    )
  } catch (error) {
    /* Log the details on the server: provider errors can contain internal information */
    console.error('Chat error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
