'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/_utils/supabase/server';

export async function login(email: string, password: string) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const { error } = await supabase.auth.signInWithPassword({email, password});

  if (error) {
    redirect(`/login?status=${error.name}`);
  }

  revalidatePath('/');
  redirect('/');
}

export async function signup(email: string, password: string) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/sign-up?status=${error.name}`);
  }

  revalidatePath('/login?status=EmailSent', 'layout');
  redirect('/login?status=EmailSent');
}

export async function logout() {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(`/login?status=${error.name}`);
  }

  revalidatePath('/');
  redirect('/');
}
