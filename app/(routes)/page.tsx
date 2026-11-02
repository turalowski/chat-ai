import ChatPage from '@/app/_components/chat-page'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/_utils/supabase/server'
import { AppProvider } from '../_context/Chat'

// Please do pay attention to how long your API requests
// run as it may run up your bill or may make you eventually
// actually have a bill. Free version of Vercel has 60
// seconds max duration.
export const maxDuration = 60

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const documentPath =
    typeof searchParams?.document_id === 'string'
      ? searchParams.document_id
      : undefined

  const menu =
    typeof searchParams?.menu === 'string' ? searchParams.menu : 'menu'

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect('/login')
  }

  return (
    <AppProvider>
      <ChatPage documentPath={documentPath} menu={menu} />
    </AppProvider>
  )
}
