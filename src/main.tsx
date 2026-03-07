import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { shadcn } from '@clerk/ui/themes'
import './styles/globals.css'
import App from './App'

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
