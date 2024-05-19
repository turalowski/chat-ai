import ChatPage from '@/app/_components/chat-page';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/_utils/supabase/server';
import { AppProvider } from '../_context/Chat';

export const maxDuration = 300; // Applies to the actions

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect('/login');
  }

  return (
    <AppProvider>
      <ChatPage
        email={user?.email!}
        document_id={
          typeof searchParams?.document_id === 'string'
            ? searchParams.document_id
            : undefined
        }
      />
    </AppProvider>
  );
}
