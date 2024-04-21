'use client';

import { useRouter } from 'next/navigation';
import { deleteDocument } from '../_actions/documents';
import { TrashIcon } from './icons';
import { toast } from './ui/use-toast';

interface DeleteProps extends React.HTMLAttributes<HTMLElement> {
  document_id: string;
}

export function Delete({ document_id, ...props }: DeleteProps) {
  const router = useRouter();

  const onClick = async () => {
    try {
      await deleteDocument(document_id);
      router.refresh();
      toast({
        title: 'Selected file has been deleted',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: 'error.message',
        });
      }
    }
  };

  return <TrashIcon className="hover:cursor-pointer" onClick={onClick} />;
}
