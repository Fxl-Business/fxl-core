import { SignIn } from '@clerk/react'

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 dark:bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Nexo</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Acesse a plataforma operacional</p>
      </div>
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </div>
  )
}
