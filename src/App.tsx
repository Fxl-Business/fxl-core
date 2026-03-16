import { BrowserRouter } from 'react-router-dom'
import { ModuleEnabledProvider } from '@platform/module-loader/hooks/useModuleEnabled'
import { ExtensionProvider } from '@platform/module-loader/slots'
import { Toaster } from '@shared/ui/sonner'
import AppRouter from '@platform/router/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <ModuleEnabledProvider>
        <ExtensionProvider>
          <AppRouter />
          <Toaster />
        </ExtensionProvider>
      </ModuleEnabledProvider>
    </BrowserRouter>
  )
}
