'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { deleteDocument } from '../_actions/documents';
import { TrashIcon } from './icons';
import { toast } from './ui/use-toast';
import { MouseEventHandler, useTransition } from 'react';
import { Spinner } from './spinner';

interface DeleteProps extends React.HTMLAttributes<HTMLElement> {
  documentId: number;
  documentPath: string;
}

export function Delete({ documentId, documentPath }: DeleteProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const params = new URLSearchParams(
    searchParams as unknown as URLSearchParams
  );

  const onClick: MouseEventHandler<SVGGElement> = async event => {
    event.stopPropagation();
    try {
      startTransition(async () => {
        await deleteDocument(documentId, documentPath);
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
        console.log('Delete document error: ', error.message)
        toast({
          title: 'Failed to delete the document'
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
