'use client'

import { useRef } from 'react'
import { Card, CardDescription, CardHeader } from '@/app/_components/ui/card'
import { useAppContext } from '@/app/_context/Chat'

export default function Suggestions() {
    const {
        query,
        setQuery,
        setLoading,
        setError,
        messageState,
        setMessageState,
    } = useAppContext()
    const { history } = messageState

    const messageListRef = useRef<HTMLDivElement>(null)

    async function handleSubmit(e: any, manual?: string) {
        e.preventDefault()

        setError(null)

        if (!query && !manual) {
            alert('Please input a question')
            return
        }

        const question = query.trim()

        setMessageState((state) => ({
            ...state,
            messages: [
                ...state.messages,
                {
                    type: 'userMessage',
                    message: manual || question,
                },
            ],
        }))

        setLoading(true)
        setQuery('')

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
            })
            const data = await response.json()

            if (data.error) {
                setError(data.error)
            } else {
                setMessageState((state) => ({
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
                }))
            }
            setLoading(false)

            //scroll to bottom
            messageListRef.current?.scrollTo(
                0,
                messageListRef.current.scrollHeight
            )
        } catch (error) {
            setLoading(false)
            setError(
                'An error occurred while fetching the data. Please try again.'
            )
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 w-full flex-wrap items-start">
            <Card
                className="hover:bg-gray-100 hover:cursor-pointer"
                onClick={(event) => {
                    handleSubmit(event, 'Summarize this document.')
                }}
            >
                <CardHeader className="p-2">
                    <CardDescription>Summarize this document.</CardDescription>
                </CardHeader>
            </Card>
            <Card
                className="hover:bg-gray-100 hover:cursor-pointer"
                onClick={(event) => {
                    handleSubmit(event, 'What are the highlights?')
                }}
            >
                <CardHeader className="p-2">
                    <CardDescription>What are the highlights?</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
