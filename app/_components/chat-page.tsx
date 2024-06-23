import { SidebarNav } from './sidebar';
import Header from './header';
import Messages from './messages';
import Suggestions from './suggestions';
import NewMessage from './new-message';
import ErrorAlert from './error-alert';
import { createClient } from '../_utils/supabase/server';
import { Menu } from './menu';
import { SidebarFiles } from './sidebar-files';
import { SidebarGroups } from './sidebar-groups';

const ChatPage = async ({
  documentPath,
  menu,
}: {
  documentPath: string | undefined;
  menu: string;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="h-screen flex flex-col px-3 3xl:px-48 gap-6 py-6 items-center justify-center">
      <Header email={user?.email!} />
      <div className="grow w-full flex flex-row gap-3">
        <div className="">
          <Menu />
        </div>
        <div className="">
          <SidebarNav>
            {menu !== 'group' && <SidebarFiles />}
            {menu === 'group' && <SidebarGroups />}
          </SidebarNav>
        </div>
        <div className="flex gap-3 flex-col grow w-full ">
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
