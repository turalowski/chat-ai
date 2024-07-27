import { useSearchParams } from 'next/navigation'
import { useAppContext } from '../_context/Chat'
import { useRef } from 'react'
import { toast } from '../_components/ui/use-toast'

const useChat = () => {
    const {
        query,
        setQuery,
        setLoading,
        setError,
        messageState,
        setMessageState,
    } = useAppContext()
    const { history } = messageState
    const searchParams = useSearchParams()
    const documentPath = searchParams.get('document_id')
    const messageListRef = useRef<HTMLDivElement>(null)
    const groupId = searchParams.get('group_id')

    const handleSubmit = async (e: any, manual?: string) => {
        e.preventDefault()

        setError(null)

        if (!documentPath && !groupId) {
            toast({
                title: 'Select a document or group first',
            })
            return
        }
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
                    sourceDocs: [],
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
                    documentPath,
                    groupId,
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
                            sourceDocs: JSON.parse(data.sourceDocuments),
                        },
                    ],
                    history: [...state.history, [question, data.text]],
                }))
            }

            setLoading(false)

            // Scroll to bottom
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

    return { handleSubmit, messageListRef }
}

export default useChat

