'use client';

import { useRef } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import { SendHorizonalIcon } from 'lucide-react';
import { useAppContext } from '@/app/_context/Chat';
import { useSearchParams } from 'next/navigation';

export default function NewMessage({
  documentPath,
}: {
  documentPath: string | undefined;
}) {
  const {
    query,
    setQuery,
    loading,
    setLoading,
    setError,
    messageState,
    setMessageState,
  } = useAppContext();
  const { history } = messageState;

  const searchParams = useSearchParams();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const selectedDocumentPath = params.get('document_id');
  const groupId = params.get('group_id');

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: any, manual?: string) {
    e.preventDefault();

    setError(null);

    if (!query && !manual) {
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
          message: manual || question,
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
          question: question || manual,
          documentPath,
          groupId,
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
          loading ? 'Waiting for response...' : 'Describe this document.'
        }
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        disabled={loading || (!selectedDocumentPath && !groupId)}
      >
        {loading ? (
          <ReloadIcon className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonalIcon className=" h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
