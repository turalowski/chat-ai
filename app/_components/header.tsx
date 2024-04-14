'use client';

import { useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import { logout } from '@/app/_actions/auth';
import { toast } from './ui/use-toast';
import { postDocument } from '@/app/_actions/documents';
import { useRouter } from 'next/navigation';
import {
  flushVectorialDatabase,
  storeDocumentVectors,
} from '../_actions/pinecone';

export default function Header({ email }: { email: string }) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();

  async function handleUploadClick() {
    try {
      setUploading(true);
      if (file) {
        const formData = new FormData();
        formData.set('file', file, file?.name);
        await postDocument(formData);
        await flushVectorialDatabase();
        await storeDocumentVectors(formData);
      }


      toast({
        title: 'File has been uploaded',
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: error.message,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center w-full gap-12 justify-between">
      <h1 className="hidden md:block text-2xl font-bold leading-[1.1] tracking-tighter text-center">
        Chat AI
      </h1>
      <div className="flex gap-3">
        <Input
          id="file"
          type="file"
          accept="application/pdf"
          onChange={event => {
            const file = event?.target?.files?.[0];
            if (file) {
              setFile(file);
            }
          }}
        />
        <Button
          disabled={!file || uploading}
          onClick={handleUploadClick}
          className="flex items-center gap-3"
        >
          {uploading && <ReloadIcon className="h-4 w-4 animate-spin" />}
          Upload
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span>{email}</span>
        <Button
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
