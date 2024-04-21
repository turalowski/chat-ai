import { cn } from '@/app/_lib/utils';
import { Document } from '../_lib/types';
import { Delete } from './delete';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  documents: Document[];
}

export function SidebarNav({
  documents,
  className,
  ...props
}: SidebarNavProps) {
  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 border-md border p-1 text-sm h-full rounded-md overflow-hidden',
        className
      )}
      {...props}
    >
      <h1 className="text-md p-2">Files</h1>
      <div className="flex flex-col gap-1 overflow-scroll">
        {documents.map(document => (
          <div
            key={document.id}
            className="flex items-center justify-between hover:bg-slate-100 p-2 rounded-md"
          >
            <span>
              {document.name.length > 20
                ? `${document.name.substring(0, 20)}...`
                : document.name}
            </span>
            <Delete document_id={document.document_id} />
          </div>
        ))}
      </div>
    </nav>
  );
}
