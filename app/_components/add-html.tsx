'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReloadIcon, Link1Icon } from '@radix-ui/react-icons';
import { uploadDocument } from '../_utils/upload-document';
import { storeDocumentVectors } from '../_actions/pinecone';
import { toast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog';
import { Button } from './ui/button';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function AddHtml({ className }: SidebarNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [open, setOpen] = useState(false);

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 25);
    setFileName(value);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      // Add http:// prefix if not present
      const prefixedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
      new URL(prefixedUrl);
      return true;
    } catch (e) {
      return false;
    }
  };

  async function handleSavePDF() {
    startTransition(async () => {
      if (!url || !isValidUrl(url)) {
        toast({
          title: 'Please enter a valid URL',
        });
        return;
      }

      if (!fileName) {
        toast({
          title: 'Please enter a file name',
        });
        return;
      }

      try {
        const response = await fetch('/api/html', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to convert HTML to PDF');
        }
        
        const pdfBuffer = await response.arrayBuffer();
        // Convert Uint8Array to Blob
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const file = new File([pdfBlob], `${fileName}.pdf`, {
          type: 'application/pdf',
        });

        console.log('file', file)

        // Upload the PDF file
        const documentPath = await uploadDocument(file)

        // Store document vectors
        await storeDocumentVectors(documentPath, file.name)

        // Update URL parameters
        const params = new URLSearchParams(
          searchParams as unknown as URLSearchParams
        )
        params.set('document_id', documentPath)
        router.replace(`${pathname}?${params.toString()}`, {
          scroll: false,
        })

        toast({
          title: 'PDF has been created and uploaded',
        })

        // Close the dialog if function ends without any error
        setOpen(false);
      } catch (error: any) {
        toast({
          title: error.message || 'Failed to create and upload PDF',
        });
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Label className="h-8 w-8 border flex items-center justify-center rounded hover:cursor-pointer">
            {isPending ? (
              <ReloadIcon className="h-4 w-4 animate-spin" />
            ) : (
              <Link1Icon className="h-4 w-4" />
            )}
          </Label>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter URL and File Name</DialogTitle>
            <DialogDescription>
              Entered page will be converted to a pdf document
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                placeholder="https://x"
                className="col-span-3"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileName" className="text-right">
                File Name
              </Label>
              <Input
                id="fileName"
                placeholder="my-file"
                className="col-span-3"
                value={fileName}
                onChange={handleFileNameChange}
                maxLength={25}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSavePDF} disabled={isPending}>
              {isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save PDF'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>{' '}
    </>
  );
}
