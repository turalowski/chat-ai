'use client';

import { cn } from '@/app/_lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { FileIcon, FolderIcon, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function Menu({ className, ...props }: SidebarNavProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const menu = params.get('menu');

  const updateMenu = (newMenu: string) => {
    if (menu !== newMenu) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        params.set('menu', newMenu);
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        });
      });
    }
  };

  const onFileClick = () => updateMenu('file');
  const onGroupClick = () => updateMenu('group');

  return (
    <nav
      className={cn(
        'flex justify-between items-center space-x-2 lg:flex-col p-2 gap-3 lg:space-x-0 lg:space-y-1 border-md border text-sm h-full rounded-md',
        className
      )}
      {...props}
    >
      <div className='flex flex-col items-center gap-3'>
        <Button variant="outline" size="icon" onClick={onFileClick}>
          <FileIcon size={16} />
        </Button>
        <Button variant="outline" size="icon" onClick={onGroupClick}>
          <FolderIcon size={16} />
        </Button>
      </div>
      <Button variant="outline" size="icon" onClick={onFileClick}>
        <LogOut size={16} />
      </Button>
    </nav>
  );
}
