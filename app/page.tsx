import ChatPage from '@/components/chat-page';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AppProvider } from '../context/Chat';

export default async function Home() {
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
      <ChatPage email={user?.email!} />
    </AppProvider>
  );
}
