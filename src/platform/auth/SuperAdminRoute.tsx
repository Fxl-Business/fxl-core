import { useAuth, useUser, RedirectToSignIn } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()

  if (!authLoaded || !userLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ fontSize: 14, color: '#757575' }}>Carregando...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  if (user?.publicMetadata?.super_admin !== true) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
