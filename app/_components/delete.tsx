'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { deleteDocument } from '../_actions/documents';
import { TrashIcon } from './icons';
import { toast } from './ui/use-toast';
import { MouseEventHandler, useTransition } from 'react';
import { Spinner } from './spinner';
import { useAppContext } from '../_context/Chat';

interface DeleteProps extends React.HTMLAttributes<HTMLElement> {
  document_id: number;
  path: string;
}

export function Delete({ document_id, path }: DeleteProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const currentDocumentId = params.get('document_id');

  const onClick: MouseEventHandler<SVGGElement> = async event => {
    event.stopPropagation();
    try {
      startTransition(async () => {
        await deleteDocument(document_id, path);
        params.delete('document_id');
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        });
        toast({
          title: 'Selected file has been deleted',
        });
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: 'error.message',
        });
      }
    }
  };

  return (
    <div>
      {isPending ? (
        <Spinner size="small" />
      ) : (
        <TrashIcon
          className="hover:cursor-pointer text-sm "
          onClick={onClick}
        />
      )}
    </div>
  );
}
