# Vercel Deploy Patterns

## When to Use

Setting up Vercel deployment for an FXL spoke project. Covers initial setup, environment variables, security headers, and preview deploys.

## Initial Setup

### 1. Connect Repository

```bash
# Install Vercel CLI (if not already)
bun install -g vercel

# Link project
vercel link
```

Or connect via Vercel Dashboard:
1. Go to vercel.com/new
2. Import Git repository
3. Select the spoke project repo
4. Framework preset: Vite
5. Build command: `bun run build`
6. Output directory: `dist`

### 2. Configure vercel.json

Copy from `../templates/vercel.json.template`. Key settings:

```json
{
  "framework": "vite",
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### 3. Set Environment Variables

In Vercel Dashboard > Project > Settings > Environment Variables:

| Variable | Environments | Notes |
|----------|-------------|-------|
| `VITE_SUPABASE_URL` | Production, Preview, Development | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Supabase anon public key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Production, Preview, Development | Same as Hub |

**NEVER set these in Vercel (server-side only):**
- `SUPABASE_SERVICE_ROLE_KEY` — only if using server functions
- `CLERK_SECRET_KEY` — only if using server functions

### 4. Domain Configuration

For production:
1. Add custom domain in Vercel Dashboard > Domains
2. Convention: `{project-slug}.fxl.app` (e.g., `beach-houses.fxl.app`)
3. Add DNS records as instructed by Vercel

For preview deploys:
- Automatic: every PR gets a preview URL
- Convention: `{project-slug}-{branch}.vercel.app`

## SPA Routing

The `rewrites` rule in `vercel.json` handles SPA client-side routing:
```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```

This sends all non-API requests to `index.html`, letting React Router handle routing.

**Important:** If the spoke has Vercel Serverless Functions (in `/api/`), they are excluded from the rewrite via the `(?!api/)` pattern.

## API Routes (Serverless Functions)

If the spoke implements FXL contract endpoints as Vercel Serverless Functions:

Create files in `api/fxl/`:
```
api/
  fxl/
    manifest.ts        -> GET /api/fxl/manifest
    health.ts          -> GET /api/fxl/health
    search.ts          -> GET /api/fxl/search
    entities/
      [type].ts        -> GET /api/fxl/entities/:type
      [type]/
        [id].ts        -> GET /api/fxl/entities/:type/:id
    widgets/
      [id]/
        data.ts        -> GET /api/fxl/widgets/:id/data
```

Each function:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate Clerk token
  // Query data
  // Return response
}
```

**Note:** For simple SPAs, contract endpoints can also be implemented client-side using Supabase directly (with RLS handling the auth). Serverless functions are only needed if you want server-side processing.

## Preview Deploy Configuration

Preview deploys are automatic for every PR. Configure behavior:

```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

For preview-specific env vars, use the "Preview" environment scope in Vercel Dashboard.

## Build Optimization

### Vite Build Settings

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          clerk: ['@clerk/react'],
        },
      },
    },
  },
})
```

### Cache Headers

Vite generates hashed filenames for assets. Add cache headers:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Troubleshooting

### Build fails on Vercel but works locally
- Check that all `VITE_*` env vars are set in Vercel
- Vercel uses Node.js 18 by default — match locally with Bun
- Run `bun run build` locally to replicate

### 404 on page refresh
- Verify the SPA rewrite rule in `vercel.json`
- The `/((?!api/).*)` pattern must match all non-API routes

### API routes return 404
- File must be in `api/` directory at project root (not `src/api/`)
- Function must `export default` a handler

### Slow cold starts on serverless functions
- Use `api/` functions only for auth-gated endpoints
- Keep functions lightweight (avoid large imports)
- Consider using Supabase directly from client-side with RLS instead
