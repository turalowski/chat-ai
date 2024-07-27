import { SidebarNav } from './sidebar'
import Messages from './messages'
import Suggestions from './suggestions'
import NewMessage from './new-message'
import ErrorAlert from './error-alert'
import { createClient } from '../_utils/supabase/server'
import { Menu } from './menu'
import { SidebarFiles } from './sidebar-files'
import { SidebarGroups } from './sidebar-groups'
import { PreviewPdf } from './preview-pdf'

const ChatPage = async ({
    documentPath,
    menu,
}: {
    documentPath: string | undefined
    menu: string
}) => {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <main className="h-screen flex flex-col px-3 3xl:px-48 gap-6 py-6 items-center justify-center">
            <div className="grow w-full flex flex-row gap-3">
                <div className="">
                    <Menu email={user?.email!} />
                </div>
                <div className="">
                    <SidebarNav>
                        {menu !== 'group' && <SidebarFiles />}
                        {menu === 'group' && <SidebarGroups />}
                    </SidebarNav>
                </div>
                {documentPath && (
                    <div className="flex grow w-full">
                        <PreviewPdf documentPath={documentPath} />
                    </div>
                )}
                <div className="flex gap-3 w-[1400px] flex-col">
                    <Messages />
                    <Suggestions />
                    <NewMessage />
                    <ErrorAlert />
                </div>
            </div>
        </main>
    )
}

export default ChatPage
