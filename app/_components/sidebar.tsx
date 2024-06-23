import { cn } from '@/app/_lib/utils';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function SidebarNav({ children, className, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        'flex space-x-2 w-[200px] min-w-[200px] max-w-[200px] lg:flex-col lg:space-x-0 lg:space-y-1 border-md border p-1 text-sm h-full rounded-md overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}
