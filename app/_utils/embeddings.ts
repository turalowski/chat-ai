import { Embeddings } from '@langchain/core/embeddings'

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-4' /* The Pinecone index must match this model's 1024 dimensions */
/* Chunks are about 1000 characters, so this stays well below Voyage's limit of tokens per request */
const MAX_TEXTS_PER_REQUEST = 128

type InputType = 'query' | 'document'

type VoyageResponse = {
  data: { embedding: number[]; index: number }[]
}

/* Embeddings for LangChain and Pinecone. Anthropic has no embeddings API, so these come from Voyage AI. */
export class VoyageEmbeddings extends Embeddings {
  constructor() {
    super({})
  }

  /* Function to embed the document chunks, in batches, in their original order */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = []
    for (let i = 0; i < texts.length; i += MAX_TEXTS_PER_REQUEST) {
      const batch = texts.slice(i, i + MAX_TEXTS_PER_REQUEST)
      embeddings.push(...(await this.embed(batch, 'document')))
    }
    return embeddings
  }

  /* Function to embed a search question */
  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embed([text], 'query')
    return embedding
  }

  /* Voyage optimizes each embedding for its role, which improves search results */
  private embed(input: string[], inputType: InputType) {
    return this.caller.call(async () => {
      const response = await fetch(VOYAGE_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          model: VOYAGE_MODEL,
          input_type: inputType,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Voyage AI request failed with status ${response.status}`)
      }

      const { data } = (await response.json()) as VoyageResponse
      return data
        .sort((a, b) => a.index - b.index)
        .map(({ embedding }) => embedding)
    })
  }
}
