'use client';

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Document } from 'langchain/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonalIcon } from 'lucide-react';

type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState(state => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState(state => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-3 2xl:px-96 gap-6 py-6 items-center justify-center">
      <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
        Chat AI
      </h1>
      <div
        ref={messageListRef}
        className="flex grow w-full h-full flex-col border-gray-300 border gap-3 p-6"
      >
        {messages.map((message, index) => {
          return (
            <div
              key={`chatMessage-${index}`}
              className={`bg-gray-100 rounded-md p-3 ${
                message.type === 'apiMessage' ? 'text-red-500' : 'text-blue-500'
              }`}
            >
              <ReactMarkdown>{message.message}</ReactMarkdown>
            </div>
          );
        })}
      </div>
      <form className="w-full flex gap-3" onSubmit={handleSubmit}>
        <Input
          disabled={loading}
          className="w-full"
          ref={textAreaRef}
          autoFocus={false}
          maxLength={512}
          id="userInput"
          name="userInput"
          placeholder={
            loading
              ? 'Waiting for response...'
              : 'What is this legal case about?'
          }
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <ReloadIcon className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonalIcon className=" h-4 w-4" />
          )}
        </Button>
      </form>
      {error && (
        <div className="border border-red-400 rounded-md p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </main>
  );
}
