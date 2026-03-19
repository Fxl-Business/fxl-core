import { BrowserRouter } from 'react-router-dom'
import { ModuleEnabledProvider } from '@platform/module-loader/hooks/useModuleEnabled'
import { ExtensionProvider } from '@platform/module-loader/slots'
import { Toaster } from '@shared/ui/sonner'
import AppRouter from '@platform/router/AppRouter'
import { ImpersonationProvider } from '@platform/auth/ImpersonationContext'
import { OrgTokenProvider } from '@platform/tenants/OrgTokenContext'
import { invalidateDocsCache } from '@modules/docs/services/docs-service'

export default function App() {
  return (
    <BrowserRouter>
      <OrgTokenProvider onOrgChange={invalidateDocsCache}>
        <ImpersonationProvider>
          <ModuleEnabledProvider>
            <ExtensionProvider>
              <AppRouter />
              <Toaster />
            </ExtensionProvider>
          </ModuleEnabledProvider>
        </ImpersonationProvider>
      </OrgTokenProvider>
    </BrowserRouter>
  )
}
