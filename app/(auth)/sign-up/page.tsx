import { Suspense } from 'react';
import { AuthForm } from '../_components/AuthForm';
import { signup } from '../../actions/auth';

export default function SignUp() {
  return (
    <main className="min-h-screen flex grow flex-col items-center justify-center">
      <nav className="h-full flex grow items-center flex-col justify-center px-6 md:px-0 w-full sm:w-4/5 md:w-2/3 lg:w-1/3">
        <div className="w-full flex flex-col gap-6">
          <Suspense>
          <AuthForm submitButtonLabel="Sign Up" handleSubmit={signup} />

          </Suspense>
        </div>
      </nav>
    </main>
  );
}
