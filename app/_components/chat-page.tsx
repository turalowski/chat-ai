'use client';

import { useRef, useState } from 'react';
import { SidebarNav } from './sidebar';
import Header from './header';
import Messages from './messages';
import { useAppContext } from '@/app/_context/Chat';
import Suggestions from './suggestions';
import NewMessage from './new-message';
import ErrorAlert from './error-alert';

export default function ChatPage({ email }: { email: string }) {
  const {
    query,
    setQuery,
    loading,
    setLoading,
    error,
    setError,
    messageState,
    setMessageState,
  } = useAppContext();
  const { history } = messageState;

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
    <main className="h-screen flex flex-col px-3 2xl:px-96 gap-6 py-6 items-center justify-center">
      <Header email={email} />
      <div className="grow flex-row  w-full grid grid-cols-5 gap-3">
        <div className="col-span-1">
          <SidebarNav />
        </div>
        <div className="flex gap-3 flex-col grow w-full col-span-4">
          <Messages messageState={messageState} email={email} />
          <Suggestions />
          <NewMessage />
          <ErrorAlert />
        </div>
      </div>
    </main>
  );
}
