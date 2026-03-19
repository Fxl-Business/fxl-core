/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  /** Supabase Edge Function base URL for token exchange */
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string
  /** Sentry DSN for error reporting */
  readonly VITE_SENTRY_DSN?: string
  /** Sentry environment tag (defaults to 'production') */
  readonly VITE_SENTRY_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.md' {
  const content: string
  export default content
}
