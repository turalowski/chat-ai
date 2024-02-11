import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { pinecone } from '@/app/_utils/pinecone-client';

const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE as string;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;
