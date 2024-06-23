import { SidebarFile } from './sidebar-file';
import { getDocuments } from '../_actions/documents';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export async function SidebarFiles({ className, ...props }: SidebarNavProps) {
  let documents = await getDocuments();

  return (
    <>
      <h1 className="text-md p-2">Files</h1>
      <div className="flex flex-col gap-1 overflow-auto h-full">
        {documents.map(document => (
          <SidebarFile document={document} key={document.id} />
        ))}
      </div>
    </>
  );
}
