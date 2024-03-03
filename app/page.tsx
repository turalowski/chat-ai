import ChatPage from '@/components/chat-page';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/_utils/supabase/server';

export default async function Home() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect('/login')
  }
  
  return <ChatPage />;
}
