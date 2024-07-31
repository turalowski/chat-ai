import type { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from '@langchain/pinecone'
import { makeChain } from '@/app/_utils/makechain'
import { pinecone } from '@/app/_utils/pinecone-client'
import { createClient } from '@/app/_utils/supabase/server'
import { VectorStore } from 'langchain/vectorstores/base'

/* Retrieve Pinecone configurations from environment variables */
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string

export async function POST(req: Request) {
  /* Parse the request body to extract the question and history */
  try {
    const { question, history, documentPath, groupId } = await req.json()

    if (!documentPath && !groupId) {
      throw new Error('Select a document or group first first.')
    }

    /* Throw an error if the question field is missing */
    if (!question) {
      throw new Error('No question in the request.')
    }
    /* Sanitize the question by trimming and replacing newlines with spaces as recommended by OpenAI */
    const sanitizedQuestion = question.trim().replaceAll('\n', ' ')
    /* Initialize the Pinecone index with the given index name */
    const index = pinecone.Index(PINECONE_INDEX_NAME)
    let documentPaths: string[] = []

    if (documentPath) {
      documentPaths = [documentPath]
    }

    if (groupId) {
      console.log('group groupId', groupId)
      // Create a client instance for Supabase
      const supabase = createClient()
      // Retrieve the currently authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // If a user is authenticated
      if (user) {
        // Query the 'user_documents' table to select documents where user_id matches the authenticated user's id
        const response = supabase
          .from('document_groups')
          .select()
          .eq('id', groupId)
          .returns<
            {
              id: number
              name: string
              document_paths: string[]
              user_id: string
            }[]
          >()
        const { data, error } = await response
        if (data && data.length > 0) {
          documentPaths = data[0].document_paths
        }
      } else {
        throw new Error('User id is missing')
      }
    }

    console.log('testtt', documentPaths)

    /* Connect to the Pinecone vector store with the specified index, embedding model, and configurations */
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
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
      .map((message: [string, string]) => {
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
    console.log('surceDocuments', sourceDocuments)
    /* Return the response along with source documents with a 200 status code */
    return Response.json(
      { text: response, sourceDocuments: JSON.stringify(sourceDocuments) },
      {
        status: 200,
      }
    )
  } catch (error: any) {
    /* Catch and return any errors encountered during the process with a 500 status code */
    return Response.json(
      { error: error.message || 'Something went wrong' },
      {
        status: 500,
      }
    )
  }
}
