import clsx from 'clsx'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function SidebarNav({ children, className, ...props }: SidebarNavProps) {
  return (
    <nav
      className={clsx(
        'flex w-[250px] min-w-[250px] max-w-[250px]',
        'flex-col',
        'border-md border p-1 text-sm h-full',
        'rounded-md overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </nav>
  )
}
