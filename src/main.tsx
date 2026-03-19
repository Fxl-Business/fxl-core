import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { shadcn } from '@clerk/ui/themes'
import * as Sentry from '@sentry/react'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import 'highlight.js/styles/github-dark-dimmed.css'
import './styles/globals.css'
import App from './App'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  })
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{ theme: shadcn }}
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignOutUrl="/login"
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
