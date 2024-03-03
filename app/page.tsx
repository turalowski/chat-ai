import ChatPage from '@/components/chat-page';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/_utils/supabase/server';

export default async function Home() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.log(error?.message);
    console.log(data);
    redirect('/login');
  }
  return <ChatPage />;
}
