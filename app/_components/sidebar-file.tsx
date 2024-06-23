'use client';

import { Delete } from './delete';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Spinner } from './spinner';
import { File } from 'lucide-react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  document: {
    id: number;
    path: string;
    name: string;
  };
}

export function SidebarFile({
  document,
  className,
  ...props
}: SidebarNavProps) {
  const { id, name, path } = document;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const selectedDocumentId = params.get('document_id');

  const onFileClick = (documentId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('document_id', documentId);
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  return (
    <div
      key={id}
      onClick={() => onFileClick(path)}
      className={`flex items-center justify-start hover:bg-slate-100 p-2 gap-1 rounded-md hover:cursor-pointer ${
        selectedDocumentId === path ? 'bg-gray-100' : null
      }`}
    >
      {isPending && params.get('document_id') === path ? (
        <Spinner size="small" />
      ) : (
        <File size="16px" />
      )}
      <span>{name.length > 20 ? `${name.substring(0, 20)}...` : name}</span>

      <div className="ml-auto">
        <Delete documentId={id} documentPath={path} />
      </div>
    </div>
  );
}
