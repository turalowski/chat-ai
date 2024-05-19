import { SidebarNav } from './sidebar';
import Header from './header';
import Messages from './messages';
import Suggestions from './suggestions';
import NewMessage from './new-message';
import ErrorAlert from './error-alert';
import { getDocuments } from '../_actions/documents';

const ChatPage = async ({
  email,
  document_id,
}: {
  email: string;
  document_id: string | undefined;
}) => {
  let documents = await getDocuments();
  return (
    <main className="h-screen flex flex-col px-3 2xl:px-96 gap-6 py-6 items-center justify-center">
      <Header email={email} />
      <div className="grow flex-row  w-full grid grid-cols-5 gap-3">
        <div className="col-span-1">
          <SidebarNav documents={documents || []} />
        </div>
        <div className="flex gap-3 flex-col grow w-full col-span-4">
          <Messages document_id={document_id} />
          <Suggestions />
          <NewMessage document_id={document_id} />
          <ErrorAlert />
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
