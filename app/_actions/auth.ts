'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/_utils/supabase/server';

export async function login(email: string, password: string) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?status=${error.name}&message=${error.message}`);
  } else {
    revalidatePath('/');
    redirect('/');
  }
}

export async function signup(email: string, password: string) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const response = await supabase.auth.signUp({
    email,
    password,
  });

  if (response.error?.name) {
    return redirect(
      `/sign-up?message=${encodeURI(response.error.message)}&status=${encodeURI(
        response.error.name
      )}`
    );
  }

  // No confirmation email is needed when signup returns a session, as on local Supabase
  if (response.data.session) {
    revalidatePath('/');
    redirect('/');
  }

  if (response.data && response.data.user) {
    // Check if the user got created
    if (
      response.data.user.identities &&
      response.data.user.identities.length > 0
    ) {
      redirect(`/login?message=${encodeURI('Please check your mailbox')}`);
    } else {
      redirect(
        `/sign-up?message=${encodeURI('Email address is already taken')}`
      );
    }
  }
}

export async function logout() {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(`/login?status=${error.name}`);
  }
  redirect('/login');
}
