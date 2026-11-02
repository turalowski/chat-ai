import Anthropic from '@anthropic-ai/sdk'
import { PromptTemplate } from 'langchain/prompts'
import { RunnableSequence } from 'langchain/schema/runnable'
import type { Document } from 'langchain/document'
import type { VectorStoreRetriever } from 'langchain/vectorstores/base'

const MODEL = 'claude-opus-5-5' /* change this to another Claude model if you prefer */

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. Reply with only the standalone question.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`

const QA_TEMPLATE = `You are an expert researcher. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context or chat history, politely respond that you are tuned to only answer questions that are related to the context.

<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
Helpful answer in markdown:`

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent)
  return serializedDocs.join(separator)
}

/* Function to send a formatted prompt to Claude and return the text of its answer. */
const askClaude =
  (client: Anthropic, effort: 'low' | 'medium') =>
  async (prompt: { toString(): string }) => {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort },
      /* If Claude's safety checks decline a request, retry it on a fallback model. */
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: prompt.toString() }],
    })

    if (response.stop_reason === 'refusal') {
      throw new Error('Claude declined to answer this question.')
    }

    return response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
  }

/* Function to create the conversational retrieval QA chain. */
export const makeChain = (retriever: VectorStoreRetriever) => {
  /* Create prompt templates from the defined templates. */
  const condenseQuestionPrompt = PromptTemplate.fromTemplate(CONDENSE_TEMPLATE)
  const answerPrompt = PromptTemplate.fromTemplate(QA_TEMPLATE)
  /* Initialize the Claude client, which reads ANTHROPIC_API_KEY from the environment. */
  const client = new Anthropic()

  /* Create a sequence to rephrase the question based on chat history. */
  const standaloneQuestionChain = RunnableSequence.from([
    condenseQuestionPrompt,
    askClaude(client, 'low'),
  ])
  /* Create a sequence to retrieve documents based on a query and format them. */
  const retrievalChain = (retriever as any).pipe(combineDocumentsFn)
  /* Create a sequence to generate an answer based on standalone question, chat history, and retrieved documents. */
  const answerChain = RunnableSequence.from([
    {
      context: RunnableSequence.from([
        (input) => input.question,
        retrievalChain,
      ]),
      chat_history: (input) => input.chat_history,
      question: (input) => input.question,
    },
    answerPrompt,
    askClaude(client, 'medium'),
  ])
  /* Combine the sequences to first generate a standalone question, then answer it based on chat history and retrieved context documents. */
  const conversationalRetrievalQAChain = RunnableSequence.from([
    {
      question: standaloneQuestionChain,
      chat_history: (input) => input.chat_history,
    },
    answerChain,
  ])
  /* Return the final conversational retrieval QA chain. */
  return conversationalRetrievalQAChain
}
