import { useAuth, useUser, RedirectToSignIn } from '@clerk/react'
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

export default function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  // Ensure Supabase JWT is set for admin routes (same as ProtectedRoute)
  const { isReady: tokenReady, error: tokenError } = useOrgTokenExchange({ onOrgChange: invalidateDocsCache })

  if (!authLoaded || !userLoaded) {
    return (
      <div style={loadingStyle}>
        <p style={loadingText}>Carregando...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  if (user?.publicMetadata?.super_admin !== true) {
    return <Navigate to="/" replace />
  }

  if (tokenError) {
    return (
      <div style={loadingStyle}>
        <p style={{ ...loadingText, color: '#ef4444' }}>
          Erro ao autenticar: {tokenError}
        </p>
      </div>
    )
  }

  if (!tokenReady) {
    return (
      <div style={loadingStyle}>
        <p style={loadingText}>Autenticando...</p>
      </div>
    )
  }

  return <>{children}</>
}
