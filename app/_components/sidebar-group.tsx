'use client';

import { FolderIcon, TrashIcon } from 'lucide-react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  group: {
    id: number;
    name: string;
    docuemnt_ids: string[];
    user_id: string;
  };
}

export function SidebarGroup({ group, className, ...props }: SidebarNavProps) {
  return (
    <div
      key={group.id}
      className="flex justify-between items-center hover:bg-slate-200 p-2 hover:cursor-pointer"
    >
      <div className="flex items-center gap-1">
        <FolderIcon size={14} /> {group.name}
      </div>
      <TrashIcon size={14} color="red" />
    </div>
  );
}
