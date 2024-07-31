'use client'

import { cn } from '@/app/_lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { FileIcon, FolderIcon, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { logout } from '../_actions/auth'
import { Spinner } from './spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/_components/ui/tooltip'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  email: string
}

export function Menu({ email, className, ...props }: SidebarNavProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const params = new URLSearchParams(searchParams as unknown as URLSearchParams)

  const menu = params.get('menu')

  const updateMenu = (newMenu: string) => {
    if (menu !== newMenu) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.delete('group_id')
        params.delete('file_id')
        params.set('menu', newMenu)
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        })
      })
    }
  }

  const onFileClick = () => updateMenu('file')
  const onGroupClick = () => updateMenu('group')

  const handleLogout = () => {
    startTransition(() => {
      logout()
    })
  }
  return (
    <nav
      className={cn(
        'flex justify-between items-center flex-col',
        ' p-2 gap-3',
        'border-md border rounded-md',
        'text-sm h-full',

        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onFileClick}>
                {isPending && menu === 'group' ? (
                  <Spinner size="small" />
                ) : (
                  <FileIcon size={16} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Files</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onGroupClick}>
                {isPending && menu !== 'group' ? (
                  <Spinner size="small" />
                ) : (
                  <FolderIcon size={16} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Groups</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{email}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  )
}
