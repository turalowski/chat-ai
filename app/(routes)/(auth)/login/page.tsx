import { login } from '../../../_actions/auth'
import { AuthForm } from '../_components/AuthForm'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex grow flex-col items-center justify-center">
      <nav className="h-full flex grow items-center flex-col justify-center px-6 md:px-0 w-full sm:w-4/5 md:w-2/3 lg:w-1/3">
        <div className="w-full flex flex-col gap-6">
          <Suspense>
            <AuthForm submitButtonLabel="Login" handleSubmit={login} />
          </Suspense>
        </div>
      </nav>
    </main>
  )
}
