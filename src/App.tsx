import { BrowserRouter } from 'react-router-dom'
import { ModuleEnabledProvider } from '@platform/module-loader/hooks/useModuleEnabled'
import { ExtensionProvider } from '@platform/module-loader/slots'
import { Toaster } from '@shared/ui/sonner'
import AppRouter from '@platform/router/AppRouter'
import { ImpersonationProvider } from '@platform/auth/ImpersonationContext'

export default function App() {
  return (
    <BrowserRouter>
      <ImpersonationProvider>
        <ModuleEnabledProvider>
          <ExtensionProvider>
            <AppRouter />
            <Toaster />
          </ExtensionProvider>
        </ModuleEnabledProvider>
      </ImpersonationProvider>
    </BrowserRouter>
  )
}
