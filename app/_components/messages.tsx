'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar';
import { useAppContext } from '../_context/Chat';
import { Message } from 'postcss';

export default function Messages({ document_id }: { document_id: string | undefined }) {
  const { messageState, setMessageState } = useAppContext();
  const { messages } = messageState;
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessageState({
      messages: [],
      history: [],
    });
  }, [document_id]);

  useEffect(() => {
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="flex gap-3 flex-col grow w-full col-span-4 text-sm overflow-y-scroll h-12">
      <div
        ref={messageListRef}
        className="flex grow flex-col border-gray-300 text-sm rounded-md border gap-3 p-6 overflow-scroll"
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
    </div>
  );
}
