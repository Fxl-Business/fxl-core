import { useAuth, RedirectToSignIn, useOrganizationList } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useOrgTokenExchange } from '@platform/tenants/useOrgTokenExchange'
import { invalidateDocsCache } from '@modules/docs/services/docs-service'

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

  // Wire Clerk org → Supabase JWT token exchange.
  // Called unconditionally (hook rules). Effect runs only when session + org are ready.
  // Pass invalidateDocsCache as onOrgChange so docs reload on org switch.
  const { error: tokenError } = useOrgTokenExchange({ onOrgChange: invalidateDocsCache })

  // 1. Clerk SDK not yet loaded — show loading
  if (!isLoaded) {
    return (
      <div style={loadingStyle}>
        <p style={loadingText}>Carregando...</p>
      </div>
    )
  }

  // 2. Not signed in — redirect immediately (do NOT wait for orgsLoaded)
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // 3. Signed in, waiting for org data
  if (!orgsLoaded) {
    return (
      <div style={loadingStyle}>
        <p style={loadingText}>Carregando...</p>
      </div>
    )
  }

  // 4. Signed in but no org — redirect to onboarding
  if (userMemberships?.data?.length === 0) {
    return <Navigate to="/criar-empresa" replace />
  }

  // 5. Token exchange failed — show error (never silently allow unauthenticated Supabase access)
  if (tokenError) {
    return (
      <div style={loadingStyle}>
        <p style={{ ...loadingText, color: '#ef4444' }}>
          Erro ao autenticar: {tokenError}
        </p>
      </div>
    )
  }

  return <>{children}</>
}
