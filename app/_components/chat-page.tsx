import { SidebarNav } from './sidebar';
import Header from './header';
import Messages from './messages';
import Suggestions from './suggestions';
import NewMessage from './new-message';
import ErrorAlert from './error-alert';
import { getDocuments } from '../_actions/documents';
import { createClient } from '../_utils/supabase/server';

const ChatPage = async ({
  documentPath,
}: {
  documentPath: string | undefined;
}) => {
  const supabase = createClient();
  let documents = await getDocuments();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="h-screen flex flex-col px-3 3xl:px-48 gap-6 py-6 items-center justify-center">
      <Header email={user?.email!} />
      <div className="grow flex-row  w-full grid grid-cols-5 gap-3">
        <div className="col-span-1">
          <SidebarNav documents={documents || []} />
        </div>
        <div className="flex gap-3 flex-col grow w-full col-span-4">
          <Messages documentPath={documentPath} />
          <Suggestions />
          <NewMessage documentPath={documentPath} />
          <ErrorAlert />
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
