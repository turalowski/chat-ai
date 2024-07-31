import { SidebarFile } from './sidebar-file'
import { getDocuments } from '../_actions/documents'
import { AddFile } from './add-file'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export async function SidebarFiles({ className, ...props }: SidebarNavProps) {
  let documents = await getDocuments()

  return (
    <>
      <div className="flex items-center justify-between border-b-2 p-2">
        <h1 className="text-md">Files</h1>
        <AddFile documents={documents} />
      </div>
      <div className="flex flex-col gap-1 overflow-auto h-full">
        {documents.map((document) => (
          <SidebarFile document={document} key={document.id} />
        ))}
      </div>
    </>
  )
}
