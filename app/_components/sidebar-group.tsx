'use client';

import { FolderIcon, TrashIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Spinner } from './spinner';
import clsx from 'clsx';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  group: {
    id: number;
    name: string;
    docuemnt_ids: string[];
    user_id: string;
  };
}

export function SidebarGroup({ group, className, ...props }: SidebarNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const selectedGroup = params.get('group_id');

  const onGroupClick = () => {
    if (!isPending && selectedGroup !== String(group.id)) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        params.set('group_id', String(group.id));
        params.delete('document_id')
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        });
      });
    }
  };

  return (
    <div
      onClick={onGroupClick}
      key={group.id}
      className={clsx(
        'flex justify-between items-center hover:bg-slate-200 p-2 hover:cursor-pointer',
        selectedGroup === String(group.id) ? 'bg-slate-200' : ''
      )}
    >
      <div className={`flex items-center gap-1`}>
        {isPending ? <Spinner size="small" /> : <FolderIcon size={14} />}
        {group.name}
      </div>
      <TrashIcon size={14} color="red" />
    </div>
  );
}
