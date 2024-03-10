'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

const Messages: {
  [key: string]: string;
} = {
  EmailSent: 'Please check your mailbox',
  SignUpSuccess: 'Please enter your credentials to log in',
} as const;

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2).max(50),
});

export function AuthForm({
  submitButtonLabel,
  handleSubmit,
}: {
  submitButtonLabel: string;
  handleSubmit: Function;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const message = searchParams.get('message') as string;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await handleSubmit(values.email, values.password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center">
      <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        {submitButtonLabel}
      </h2>
      <nav className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="**********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                className="w-full flex items-center gap-3"
                disabled={loading}
              >
                {loading && <ReloadIcon className="h-4 w-4 animate-spin" />}
                {submitButtonLabel}
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-sm text-center">
          <span>
            {submitButtonLabel === 'Login'
              ? "You don't have an account yet?"
              : 'Already have an account?'}
          </span>
          <Button
            onClick={() => {
              submitButtonLabel === 'Login'
                ? router.push('sign-up')
                : router.push('login');
            }}
            className="text-blue-700"
            variant="link"
          >
            {submitButtonLabel === 'Login' ? 'Sign up' : 'Login'}
          </Button>
        </div>
        {message && (
          <Alert variant="default">
            {message && <AlertDescription>{message}</AlertDescription>}
          </Alert>
        )}
      </nav>
    </main>
  );
}
