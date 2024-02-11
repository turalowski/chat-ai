import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import type { Document } from 'langchain/document';
import type { VectorStoreRetriever } from 'langchain/vectorstores/base';

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

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
Helpful answer in markdown:`;

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map(doc => doc.pageContent);
  return serializedDocs.join(separator);
};

/* Function to create the conversational retrieval QA chain. */
export const makeChain = (retriever: VectorStoreRetriever) => {
  /* Create prompt templates from the defined templates. */
  const condenseQuestionPrompt =
    ChatPromptTemplate.fromTemplate(CONDENSE_TEMPLATE);
  const answerPrompt = ChatPromptTemplate.fromTemplate(QA_TEMPLATE);
  /* Initialize the chat model with specific parameters. */
  const model = new ChatOpenAI({
    temperature: 0 /* increase temperature to get more creative answers */,
    modelName: 'gpt-3.5-turbo' /* change this to gpt-4 if you have access */,
  });

  /* Create a sequence to rephrase the question based on chat history. */
  const standaloneQuestionChain = RunnableSequence.from([
    condenseQuestionPrompt,
    model,
    new StringOutputParser(),
  ]);
  /* Create a sequence to retrieve documents based on a query and format them. */
  const retrievalChain = (retriever as any).pipe(combineDocumentsFn);
  /* Create a sequence to generate an answer based on standalone question, chat history, and retrieved documents. */
  const answerChain = RunnableSequence.from([
    {
      context: RunnableSequence.from([input => input.question, retrievalChain]),
      chat_history: input => input.chat_history,
      question: input => input.question,
    },
    answerPrompt,
    model,
    new StringOutputParser(),
  ]);
  /* Combine the sequences to first generate a standalone question, then answer it based on chat history and retrieved context documents. */
  const conversationalRetrievalQAChain = RunnableSequence.from([
    {
      question: standaloneQuestionChain,
      chat_history: input => input.chat_history,
    },
    answerChain,
  ]);
  /* Return the final conversational retrieval QA chain. */
  return conversationalRetrievalQAChain;
};
