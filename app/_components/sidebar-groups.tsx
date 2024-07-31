import { getDocuments } from '../_actions/documents'
import { getGroups } from '../_actions/groups'
import { AddGroup } from './add-group'
import { SidebarGroup } from './sidebar-group'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export async function SidebarGroups({ className, ...props }: SidebarNavProps) {
  const groups = await getGroups()
  const documents = await getDocuments()

  return (
    <div className="">
      <div className="flex items-center justify-between border-b-2 p-2">
        <h1 className="text-md">Groups</h1>
        <AddGroup documents={documents} />
      </div>
      <div className="flex flex-col gap-1 overflow-auto h-full">
        {groups.map((group) => (
          <SidebarGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  )
}
