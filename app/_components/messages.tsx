'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'
import { useAppContext } from '../_context/Chat'
import { useSearchParams } from 'next/navigation'
import { Button } from './ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion'

export default function Messages() {
  const { messageState, setMessageState, setPage } = useAppContext()
  const { messages } = messageState
  const messageListRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams as unknown as URLSearchParams)

  const document_id = params.get('document_id')
  const group_id = params.get('group_id')
  const menu = params.get('menu')

  useEffect(() => {
    setMessageState({
      messages: [],
      history: [],
    })
  }, [group_id, document_id, menu])

  useEffect(() => {
    console.log('messages', messages)
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight)
  }, [messages])

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
              className={`flex items-center gap-3 ${
                message.type === 'apiMessage' ? 'flex-row-reverse' : 'ME'
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage className="w-2 h-2" alt="@shadcn" />
                <AvatarFallback className="text-sm">
                  {message.type === 'apiMessage' ? 'AI' : 'ME'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`border grow border-gray-200 rounded-md p-3 text-wrap truncate break-words`}
              >
                <ReactMarkdown>{message.message}</ReactMarkdown>
                <Accordion
                  type="single"
                  collapsible
                  className="max-w-full w-full text-wrap break-words"
                >
                  {message.sourceDocs.map((sourceDoc, index) => (
                    <AccordionItem value={`value-${index + 1}`} key={index}>
                      <AccordionTrigger>
                        <Button variant="link">Reference {index + 1}</Button>
                      </AccordionTrigger>
                      <AccordionContent className="">
                        {sourceDoc.pageContent}
                        {sourceDoc.metadata.pageNumber && (
                          <Button
                            variant="link"
                            className="text-blue-500"
                            onClick={() => {
                              setPage(sourceDoc.metadata.pageNumber)
                            }}
                          >
                            Go to the page {sourceDoc.metadata.pageNumber}
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
