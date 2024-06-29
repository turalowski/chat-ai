'use client';

import { FolderPlus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { FormEvent, useState, useTransition } from 'react';
import { addGroup } from '../_actions/groups';
import { useRouter } from 'next/navigation';
import { ReloadIcon } from '@radix-ui/react-icons';

interface CheckboxEvent extends React.ChangeEvent<HTMLInputElement> {}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  documents: {
    name: string;
    id: number;
    path: string;
  }[];
}

export function AddGroup({ documents, className, ...props }: SidebarNavProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [groupName, setGroupName] = useState('');
  const [dynamicDocuments, setDynamicDocuments] = useState(
    documents.map(document => ({ ...document, selected: false }))
  );

  const selectedDocuments = dynamicDocuments.filter(
    dynamicDocument => dynamicDocument.selected
  );

  const toggleDocument = (checked: boolean | string, path: string) => {
    // Prevent adding more documents if the length of selectedDocuments is 3
    if (checked === true && selectedDocuments.length >= 3) {
      return;
    }
    if (typeof checked === 'boolean') {
      const newDynamicDocuments = dynamicDocuments.map(dynamicDocument => {
        if (dynamicDocument.path === path) {
          return {
            ...dynamicDocument,
            selected: checked,
          };
        }
        return dynamicDocument;
      });
      setDynamicDocuments(newDynamicDocuments);
    }
  };

  const onSaveClick = async () => {
    startTransition(async () => {
      try {
        const selectedDocumentsPath = selectedDocuments.map(
          selectedDocument => selectedDocument.path
        );
        await addGroup(groupName, selectedDocumentsPath);
        setIsModalOpen(false);
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <>
      <Dialog
        open={isModalOpen}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isPending}
          >
            {isPending ? (
              <ReloadIcon className="h-4 w-4 animate-spin" />
            ) : (
              <FolderPlus className="h-4 w-4" size={16} />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Group name"
                className="col-span-3"
                value={groupName}
                onChange={event => setGroupName(event?.target.value)}
              />
            </div>
            <div className="items-center gap-4 mb-4">
              <Label htmlFor="username" className="text-right ">
                Files (Max 3 files allowed)
              </Label>
              <div className="flex mt-4 flex-col gap-3 min-h-full max-h-[200px] overflow-scroll">
                {dynamicDocuments.map(document => (
                  <div
                    key={document.name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id="terms"
                      checked={document.selected}
                      onCheckedChange={checked =>
                        toggleDocument(checked, document.path)
                      }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {document.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={onSaveClick}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
