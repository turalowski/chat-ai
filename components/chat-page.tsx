'use client';

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Document } from 'langchain/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SendHorizonalIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/app/(auth)/actions';
import { toast } from './ui/use-toast';

type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
};

export default function ChatPage({ email }: { email: string }) {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
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

  async function handleUploadClick() {
    try {
      setUploading(true);
      const request = await fetch(`/api/pinecone/vectors`, {
        method: 'DELETE',
      });
      if (request.ok) {
        if (file) {
          const request = await fetch('/api/store-document', {
            method: 'POST',
            body: file,
          });
          if (request.ok) {
            toast({
              title: 'File has been uploaded',
            });
          } else {
            const message = await request.text();
            throw new Error(message);
          }
        }
      } else {
        const message = await request.text();
        throw new Error(message);
      }
    } catch (error: any) {
      toast({
        title: error.message,
      });
    } finally {
      setUploading(false);
    }
  }

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
      <div className="flex items-center w-full gap-12 justify-between">
        <h1 className="hidden md:block text-2xl font-bold leading-[1.1] tracking-tighter text-center">
          Chat AI
        </h1>
        <div className="flex gap-3">
          <Input
            id="file"
            type="file"
            accept="application/pdf"
            onChange={event => {
              const file = event?.target?.files?.[0];
              if (file) {
                setFile(file);
              }
            }}
          />
          <Button
            disabled={!file || uploading}
            onClick={handleUploadClick}
            className="flex items-center gap-3"
          >
            {uploading && <ReloadIcon className="h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span>{email}</span>
          <Button
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      <div
        ref={messageListRef}
        className="flex grow w-full flex-col border-gray-300 border gap-3 p-6 overflow-scroll"
      >
        {messages.map((message, index) => {
          return (
            <div
              key={`chatMessage-${index}`}
              className={`border border-gray-200 rounded-md p-3`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage className="w-2 h-2" alt="@shadcn" />
                  <AvatarFallback className="text-sm">
                    {message.type === 'apiMessage' ? 'AI' : 'ME'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-md font-bold">
                  {message.type === 'apiMessage' ? 'AI' : 'ME'}
                </p>
              </div>
              <ReactMarkdown>{message.message}</ReactMarkdown>
            </div>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 gap-6 w-full flex-wrap items-start">
        <Card
          className="hover:bg-gray-100 hover:cursor-pointer"
          onClick={event => {
            handleSubmit(event, 'What is the main topic');
          }}
        >
          <CardHeader className="p-2">
            <CardDescription>What is the main topic?</CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="hover:bg-gray-100 hover:cursor-pointer"
          onClick={event => {
            handleSubmit(event, 'What is the main highlights?');
          }}
        >
          <CardHeader className="p-2">
            <CardDescription>What is the main highlights?</CardDescription>
          </CardHeader>
        </Card>
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
