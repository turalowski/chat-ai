'use client';

import { cn } from '@/app/_lib/utils';
import { Delete } from './delete';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '../_context/Chat';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  documents: {
    id: number;
    path: string;
    name: string;
  }[];
}

export function SidebarNav({
  documents,
  className,
  ...props
}: SidebarNavProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const selectedDocumentId = params.get('document_id');

  const onFileClick = (documentId: string) => {
    const params = new URLSearchParams(
      searchParams as unknown as URLSearchParams
    );
    params.set('document_id', documentId);
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 border-md border p-1 text-sm h-full rounded-md overflow-hidden',
        className
      )}
      {...props}
    >
      <h1 className="text-md p-2">Files</h1>
      <div className="flex flex-col gap-1 overflow-auto h-full">
        {documents.map(({ id, path, name }) => (
          <div
            key={id}
            onClick={() => onFileClick(path)}
            className={`flex items-center justify-between hover:bg-slate-100 p-2 rounded-md hover:cursor-pointer ${
              selectedDocumentId === path ? 'bg-gray-100' : null
            }`}
          >
            <span>
              {name.length > 20 ? `${name.substring(0, 20)}...` : name}
            </span>
            <Delete documentId={id} documentPath={path} />
          </div>
        ))}
      </div>
    </nav>
  );
}
