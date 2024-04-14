'use client';

import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageState } from '@/lib/types';

export default function Messages({
  messageState,
  email,
}: {
  messageState: MessageState;
  email: string;
}) {
  const { messages } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex gap-3 flex-col grow w-full col-span-4 text-sm">
      <div
        ref={messageListRef}
        className="flex grow w-full flex-col border-gray-300 rounded-md border gap-3 p-6 overflow-scroll"
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
