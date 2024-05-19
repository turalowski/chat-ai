'use client';

import { useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import { logout } from '@/app/_actions/auth';
import { toast } from './ui/use-toast';
import {
  addDocumentToDatabse,
  updateUserDocuments,
} from '@/app/_actions/documents';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { flushPineconeIndex, storeDocumentVectors } from '../_actions/pinecone';
import { createClient } from '../_utils/supabase/client';
import { v4 } from 'uuid';

export default function Header({ email }: { email: string }) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const router = useRouter();

  async function handleUploadClick() {
    const client = createClient();
    if (!file) {
      throw new Error('You need to upload a file first');
    }
    try {
      setUploading(true);
      /* Upload document to Supabase Storage */
      const { data: documentData, error: documentError } = await client.storage
        .from('documents')
        .upload(v4(), file);

      if (documentError) {
        throw documentError;
      }
      const { vectorIds } = await storeDocumentVectors(documentData?.path);
      const documentId = await addDocumentToDatabse(
        documentData?.path,
        file.name,
        vectorIds
      );
      await updateUserDocuments(documentId);

      const params = new URLSearchParams(
        searchParams as unknown as URLSearchParams
      );

      params.set('document_id', documentData?.path);
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });

      toast({
        title: 'File has been uploaded',
      });
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
