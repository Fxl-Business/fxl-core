import { useAuth, RedirectToSignIn, useOrganizationList } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  fontFamily: 'Inter, sans-serif',
}

const loadingText: React.CSSProperties = {
  fontSize: 14,
  color: '#757575',
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  // 1. Clerk SDK not yet loaded
  if (!isLoaded || !orgsLoaded) {
    return (
      <div style={loadingStyle}>
        <p style={loadingText}>Carregando...</p>
      </div>
    )
  }

  // 2. Not signed in
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // 3. Signed in but no org — redirect to onboarding
  if (userMemberships?.data?.length === 0) {
    return <Navigate to="/criar-empresa" replace />
  }

  return <>{children}</>
}
