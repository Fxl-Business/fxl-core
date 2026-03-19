import { useAuth, RedirectToSignIn, useOrganization, useOrganizationList } from '@clerk/react'
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
  // Raw Clerk active org — used ONLY as hydration guard.
  // During page reload, Clerk may briefly report empty memberships while still
  // having a cached organization. We use this to avoid a false redirect.
  // useActiveOrg handles clearing stale orgs via setActive(null).
  const { organization: clerkCachedOrg } = useOrganization()

  // Wire Clerk org → Supabase JWT token exchange.
  // Called unconditionally (hook rules). Effect runs only when session + org are ready.
  // Pass invalidateDocsCache as onOrgChange so docs reload on org switch.
  const { isReady: tokenReady, error: tokenError } = useOrgTokenExchange({ onOrgChange: invalidateDocsCache })

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

  // 4. Signed in but no org — redirect to request access.
  // Guard: during hydration, Clerk may briefly report empty memberships while
  // still having a cached org from a previous session. In that case, wait for
  // the real data to settle. useActiveOrg clears stale orgs via setActive(null),
  // so clerkCachedOrg will become null once the stale state is resolved.
  if (userMemberships?.data?.length === 0 && !clerkCachedOrg) {
    return <Navigate to="/solicitar-acesso" replace />
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

  // 6. Token exchange still in progress — wait before rendering children
  if (!tokenReady) {
    return (
      <div style={loadingStyle}>
        <p style={loadingText}>Autenticando...</p>
      </div>
    )
  }

  return <>{children}</>
}
