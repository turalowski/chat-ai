'use client';

import { useRef } from 'react';
import { Card, CardDescription, CardHeader } from '@/app/_components/ui/card';
import useChat from '../_hooks/useChat';

export default function Suggestions() {
  const { handleSubmit } = useChat();

  return (
    <div className="grid md:grid-cols-3 gap-6 w-full flex-wrap items-start">
      <Card
        className="hover:bg-gray-100 hover:cursor-pointer"
        onClick={event => {
          handleSubmit(event, 'Summarize this document.');
        }}
      >
        <CardHeader className="p-2">
          <CardDescription>Summarize this document.</CardDescription>
        </CardHeader>
      </Card>
      <Card
        className="hover:bg-gray-100 hover:cursor-pointer"
        onClick={event => {
          handleSubmit(event, 'What are the highlights?');
        }}
      >
        <CardHeader className="p-2">
          <CardDescription>What are the highlights?</CardDescription>
        </CardHeader>
      </Card>
      <Card
        className="hover:bg-gray-100 hover:cursor-pointer"
        onClick={event => {
          handleSubmit(event, 'What information can you provide?');
        }}
      >
        <CardHeader className="p-2">
          <CardDescription>What information can you provide?</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
