import { Pinecone } from '@pinecone-database/pinecone'

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string

/* Callers must verify ownership first: this uses the server's Pinecone key, so RLS doesn't apply. */
export const deleteVectorsByDocumentPath = async (path: string) => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
    })
    const index = pinecone.index(PINECONE_INDEX_NAME)

    let paginationToken: string | undefined = undefined
    do {
      const results: Awaited<ReturnType<typeof index.listPaginated>> =
        await index.listPaginated({
          prefix: `${path}#`,
          paginationToken,
        })
      const vectors = results.vectors
        ?.filter((vector) => vector !== undefined)
        .map((vector) => vector?.id)

      if (vectors?.length) {
        await index.deleteMany(vectors as string[])
      }
      paginationToken = results.pagination?.next
    } while (paginationToken)
  } catch (error: any) {
    if (error.name === 'PineconeNotFoundError') {
      return
    }
    console.error(`Deleting vectors error: ${error.message}`)
    throw error
  }
}
