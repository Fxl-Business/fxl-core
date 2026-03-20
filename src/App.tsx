import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import * as Sentry from '@sentry/react'
import { ModuleEnabledProvider } from '@platform/module-loader/hooks/useModuleEnabled'
import { ExtensionProvider } from '@platform/module-loader/slots'
import { Toaster } from '@shared/ui/sonner'
import AppRouter from '@platform/router/AppRouter'
import { ImpersonationProvider } from '@platform/auth/ImpersonationContext'
import { OrgTokenProvider } from '@platform/tenants/OrgTokenContext'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'
import { invalidateDocsCache } from '@modules/docs/services/docs-service'

/**
 * Sets Sentry user and org context whenever auth state changes.
 * Renders nothing — purely a side-effect component.
 */
function SentryContextSetter() {
  const { userId } = useAuth()
  const { activeOrg } = useActiveOrg()

  useEffect(() => {
    if (userId) {
      Sentry.setUser({ id: userId })
    } else {
      Sentry.setUser(null)
    }
  }, [userId])

  useEffect(() => {
    if (activeOrg?.id) {
      Sentry.setTag('org_id', activeOrg.id)
    } else {
      Sentry.setTag('org_id', undefined)
    }
  }, [activeOrg?.id])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <OrgTokenProvider onOrgChange={invalidateDocsCache}>
        <ImpersonationProvider>
          <ModuleEnabledProvider>
            <ExtensionProvider>
              <SentryContextSetter />
              <AppRouter />
              <Toaster />
            </ExtensionProvider>
          </ModuleEnabledProvider>
        </ImpersonationProvider>
      </OrgTokenProvider>
    </BrowserRouter>
  )
}
