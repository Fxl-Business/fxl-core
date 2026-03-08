import { UserProfile } from '@clerk/react'

export default function Profile() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <UserProfile routing="path" path="/perfil" />
    </div>
  )
}
