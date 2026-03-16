import { UserProfile } from '@clerk/react'

export default function Profile() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 dark:bg-background">
      <UserProfile routing="path" path="/perfil" />
    </div>
  )
}
