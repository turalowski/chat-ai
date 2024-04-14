'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/app/_lib/utils';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

const items = [
  {
    href: '',
    title: 'Document 1',
  },
];

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 border-md border p-3 text-sm h-full rounded-md',
        className
      )}
      {...props}
    >
      <h1>Files</h1>
      {items.map(item => (
        <Link key={item.href} href={item.href}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
