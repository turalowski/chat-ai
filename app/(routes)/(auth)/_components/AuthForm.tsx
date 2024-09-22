'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/_components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  AlertDescription,
} from '@/app/_components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState, useCallback } from 'react';

const Messages = {
  EmailSent: 'Please check your mailbox',
  SignUpSuccess: 'Please enter your credentials to log in',
  AuthRetryableFetchError: 'Internal server error',
} as const;

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(50, 'Password must not exceed 50 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  submitButtonLabel: string;
  handleSubmit: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ submitButtonLabel, handleSubmit }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      setLoading(true);
      await handleSubmit(values.email, values.password);
    } finally {
      setLoading(false);
    }
  }, [handleSubmit]);

  const toggleAuthMode = useCallback(() => {
    router.push(submitButtonLabel === 'Login' ? 'sign-up' : 'login');
  }, [router, submitButtonLabel]);

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
                className="w-full flex items-center justify-center gap-3"
                disabled={loading}
              >
                {loading && <ReloadIcon className="h-4 w-4 animate-spin" />}
                {submitButtonLabel}
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-sm text-center mt-4">
          <span>
            {submitButtonLabel === 'Login'
              ? "Don't have an account yet?"
              : 'Already have an account?'}
          </span>
          <Button
            onClick={toggleAuthMode}
            className="text-blue-700 ml-2"
            variant="link"
          >
            {submitButtonLabel === 'Login' ? 'Sign up' : 'Login'}
          </Button>
        </div>
        {(message || status) && (
          <Alert variant="default" className="mt-4">
            <AlertDescription>{Messages[status as keyof typeof Messages] || message}</AlertDescription>
          </Alert>
        )}
      </nav>
    </main>
  );
}
