/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  /** Auth mode: "anon" (default) or "org" (Clerk Organizations + token exchange) */
  readonly VITE_AUTH_MODE?: 'anon' | 'org'
  /** Supabase Edge Function base URL for token exchange (required when VITE_AUTH_MODE=org) */
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.md' {
  const content: string
  export default content
}
