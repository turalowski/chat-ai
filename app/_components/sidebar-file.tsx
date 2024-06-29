'use client';

import { Delete } from './delete';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Spinner } from './spinner';
import { File } from 'lucide-react';
import clsx from 'clsx';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  document: {
    id: number;
    path: string;
    name: string;
  };
}

export function SidebarFile({ document }: SidebarNavProps) {
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
      onClick={() => onFileClick(path)}
      className={clsx(
        'flex justify-between items-center hover:bg-slate-200 p-2 hover:cursor-pointer',
        selectedDocumentId === path ? 'bg-gray-100' : null
      )}
    >
      <div className="flex items-center gap-1">
        {isPending ? <Spinner size="small" /> : <File size={14} />}
        <span>{name.length > 20 ? `${name.substring(0, 20)}...` : name}</span>
      </div>

      <Delete documentId={id} documentPath={path} />
    </div>
  );
}
