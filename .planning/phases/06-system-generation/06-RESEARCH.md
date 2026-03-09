# Phase 6: System Generation - Research

**Researched:** 2026-03-09
**Domain:** Full-stack BI dashboard generation (Vite+React frontend, NestJS backend, Supabase database, Clerk auth)
**Confidence:** HIGH

## Summary

Phase 6 transforms the GenerationManifest (output of Phase 5's Config Resolver) into a deployable BI dashboard system. The generated system consists of two separate applications -- a Vite+React frontend and a NestJS backend -- both living in a dedicated client repository linked as a git submodule to fxl-core.

The core challenge is designing a **product spec generator** that transforms the GenerationManifest into a set of structured files that Claude Code (operating in the client repo) can consume to generate the full system. The existing `renderSkillMd()` function produces a monolithic SKILL.md; this needs to evolve into a multi-file product spec that describes WHAT to build (screens, data, rules, branding) without re-teaching HOW to use the stack (React, NestJS, Clerk skills are already installed globally).

The secondary challenge is the **template repository** -- a scaffold with NestJS backend, Vite+React frontend, Clerk auth, Supabase client, and Tailwind/shadcn already configured. The product spec fills in the dynamic parts (pages, endpoints, schemas, branding). The template repo lives as a separate GitHub repository, linked as a submodule to fxl-core.

**Primary recommendation:** Build the template repo first (backend + frontend scaffold with auth, upload, and branding plumbing), then build the product spec generator that reads GenerationManifest and outputs the multi-file spec, then validate with the pilot client (financeiro-conta-azul).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Backend separado obrigatorio -- NestJS como framework
- Frontend NUNCA conecta direto no Supabase -- toda comunicacao passa pelo backend NestJS
- 1 backend por cliente -- cada dashboard gerado tem seu proprio backend + frontend em repo separado
- Frontend: Vite + React (NAO Next.js -- SSR apenas quando justificado, dashboards BI nao precisam)
- Backend: NestJS
- Database: Supabase (PostgreSQL)
- Auth: Clerk
- Cada tabela Supabase e tipada por report type (ex: tabela `contas_a_receber` com colunas tipadas, nao estrutura generica/EAV)
- Template + product spec hibrido: um repo template base (Vite+React+NestJS scaffold) ja existe, e o product spec preenche as partes dinamicas
- Template repo vive como repo separado no GitHub, linkado como git submodule no fxl-core
- Repos de clientes gerados tambem ficam como submodules no fxl-core
- Semi-automatico com revisao: operador clona template, abre Claude Code, passa product spec. Claude gera, operador revisa e ajusta
- O output NAO e um unico SKILL.md monolitico que re-ensina como usar React/NestJS/Clerk
- Skills globais (Vite, Clerk, NestJS, shadcn, etc.) ja estao instalados no Claude Code do operador
- O output e um product spec: descreve O QUE gerar (telas, dados, regras de negocio, branding), nao COMO usar cada ferramenta
- Separado em multiplos arquivos para dar contexto organizado ao Claude Code
- Gerado automaticamente a partir do GenerationManifest
- Upload de CSV/XLSX com preview no frontend + parsing real no backend
- Backend: parsing definitivo, normalizacao de formatos BR (1.234,56 -> number, dd/mm/yyyy -> date), validacao contra schema, insert no Supabase
- Um arquivo por vez: usuario seleciona periodo (mes/ano), report type, faz upload de 1 arquivo
- Clerk como auth provider (mesmo do fxl-core)
- 3 roles: Admin (acesso total), Editor (upload + ajustes, sem settings), Viewer (read-only)
- Tela de gerenciamento de usuarios necessaria no dashboard gerado
- Para v1, foco exclusivo em Dashboard BI

### Claude's Discretion
- Estrutura exata do product spec (quantos arquivos, nomes, formato)
- Como adaptar o renderSkillMd() do Phase 5 para o novo modelo de output
- Organizacao interna do template repo (folder structure, configs base)
- Estrategia de deploy (Vercel + Railway/Render, ou outra combinacao)
- State management no frontend gerado (Zustand, React Query, Context)
- Component library no frontend gerado (shadcn/ui, Tailwind puro)
- Routing no frontend gerado
- Como implementar formula calculations no backend NestJS

### Deferred Ideas (OUT OF SCOPE)
- Painel de gerenciamento no fxl-core para monitorar status/deploy/metricas de todos os sistemas gerados -- fase futura
- Multi-tenant (1 backend servindo todos os clientes) -- avaliar quando escalar
- Tipos de sistema alem de Dashboard BI (landing page, mobile app) -- futuro, apos v1
- API-based data import (sem upload de arquivo) -- mencionado em briefing como "API futura"
- Deploy automatizado via CI/CD para projetos gerados -- avaliar apos pilot funcionar
- Visual editor para TechnicalConfig -- fase futura (Phase 5 deferred)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SGEN-01 | Scaffold de projeto Vite+React com Supabase, Tailwind, estrutura de pastas (user corrected from Next.js to Vite+React) | Template repo structure, NestJS scaffold, standard stack, architecture patterns |
| SGEN-02 | Geracao de paginas com KPIs, graficos, tabelas a partir do blueprint com dados reais | Product spec generator, GenerationManifest -> multi-file spec, TanStack Query for data fetching, recharts for charts |
| SGEN-03 | Upload CSV/XLSX com normalizacao de formatos BR e storage em Supabase | SheetJS backend parsing, NestJS file upload with Multer/FileInterceptor, BR format normalization patterns |
| SGEN-04 | Auth basico (email/senha) com roles (admin, editor, viewer) | Clerk React SPA setup, Clerk NestJS guard with @clerk/backend verifyToken, publicMetadata RBAC pattern |
| SGEN-05 | Branding do cliente aplicado automaticamente no sistema gerado | CSS variable injection pattern (--brand-*), Google Fonts loading, branding tokens in product spec |
</phase_requirements>

---

## Standard Stack

### Core (Generated Project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Frontend framework | Stable, same as fxl-core, wide ecosystem |
| Vite | 5.x | Build tool + dev server | Fast HMR, ESM-native, user decision (not Next.js) |
| NestJS | 10.x | Backend framework | Structured Node.js, modules/guards/interceptors, user decision |
| @supabase/supabase-js | 2.x | Database client (backend only) | PostgreSQL via Supabase, already used in fxl-core |
| Tailwind CSS | 3.x | Styling | Same as fxl-core, utility-first |
| TypeScript | 5.x | Type safety | Strict mode, same as fxl-core |

### Supporting (Generated Project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @clerk/react | 7.x (current SDK) | Frontend auth | Sign-in/sign-up, session management, role-based rendering |
| @clerk/backend | latest | Backend JWT verification | NestJS auth guard, verifyToken(), user metadata |
| @tanstack/react-query | 5.x | Server state management | All data fetching -- KPIs, tables, charts; caching + background refetch |
| react-router-dom | 7.x | Frontend routing | SPA routing, protected routes, layout patterns |
| recharts | 2.x | Charts | Bar, line, donut, waterfall, pareto -- same as fxl-core wireframe |
| shadcn/ui | latest | Component library | Button, Card, Table, Dialog, Sheet -- consistent with fxl-core |
| lucide-react | latest | Icons | Dashboard icons, sidebar, actions |
| xlsx (SheetJS) | 0.20.x | XLSX/CSV parsing (backend) | File upload processing, column detection, data extraction |
| @nestjs/platform-express | 10.x | HTTP adapter | Multer file uploads, Express middleware |
| passport + passport-custom | latest | Auth strategy | Clerk JWT verification strategy in NestJS |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-router-dom | TanStack Router | TanStack has better type safety but adds learning curve; react-router-dom already used in fxl-core |
| @tanstack/react-query | SWR | React Query has richer mutation support and devtools; better for dashboard data patterns |
| xlsx (SheetJS) | ExcelJS | SheetJS has better in-memory buffer parsing; ExcelJS is streaming-focused but heavier |
| passport-custom | Direct verifyToken in guard | Passport pattern is more NestJS-idiomatic and extensible |
| Zustand | React Context | Zustand is unnecessary for this case; TanStack Query handles server state; React Context sufficient for auth/theme |

**Decision: Use react-router-dom** for routing (already familiar from fxl-core, simpler for generated code). Use **TanStack React Query** for all server state (data fetching, caching, mutations). Use **React Context** only for auth state and theme/branding. No additional state management library needed.

**Installation (generated project frontend):**
```bash
npm install react react-dom react-router-dom @clerk/react @tanstack/react-query recharts lucide-react tailwindcss postcss autoprefixer class-variance-authority clsx tailwind-merge
```

**Installation (generated project backend):**
```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config @nestjs/passport passport passport-custom @clerk/backend @supabase/supabase-js xlsx
```

---

## Architecture Patterns

### Recommended Template Repo Structure

```
fxl-dashboard-template/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header, PeriodSelector
│   │   │   ├── charts/          # BarLineChart, DonutChart, WaterfallChart, ParetoChart
│   │   │   ├── cards/           # KpiCard, CalculoCard
│   │   │   ├── tables/          # DataTable, DrillDownTable, ClickableTable, ConfigTable
│   │   │   ├── upload/          # UploadSection, FilePreview
│   │   │   ├── settings/        # ManualInput, SaldoBanco, UserManagement
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── hooks/               # useAuth, useApi, usePeriod, useUpload
│   │   ├── lib/                 # api-client, format-br, query-keys
│   │   ├── pages/               # Generated per product spec
│   │   ├── providers/           # AuthProvider, QueryProvider, BrandingProvider
│   │   ├── types/               # API response types, screen types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── auth/                # ClerkStrategy, ClerkAuthGuard, roles.decorator
│   │   ├── upload/              # UploadController, UploadService, parsers/
│   │   ├── data/                # DataController, DataService (aggregations, formulas)
│   │   ├── settings/            # SettingsController, SettingsService (CRUD)
│   │   ├── common/              # filters, pipes, interceptors
│   │   ├── database/            # SupabaseModule, SupabaseService
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .product-spec/               # Product spec files (generated, Claude Code reads these)
│   ├── product-spec.md          # System overview, screens, navigation
│   ├── database-schema.sql      # Complete SQL: tables, indexes, RLS
│   ├── data-layer.md            # Fields, formulas, aggregations, thresholds
│   ├── screens.md               # Per-screen section definitions with bindings
│   ├── branding.md              # Colors, fonts, logo, CSS variables
│   └── upload-rules.md          # Report types, column mappings, BR format rules
│
├── CLAUDE.md                    # Instructions for Claude Code operating in this repo
├── README.md
└── .env.example
```

### Pattern 1: Product Spec Generator (fxl-core side)

**What:** A function that takes a GenerationManifest and outputs multiple files to disk. Replaces the monolithic `renderSkillMd()`.

**When to use:** When generating the `.product-spec/` directory for a new client.

**Approach:** Refactor `renderSkillMd()` into a multi-renderer pipeline:

```typescript
// tools/wireframe-builder/lib/spec-generator.ts
import type { GenerationManifest } from '../types/generation'

type SpecFile = {
  filename: string
  content: string
}

export function generateProductSpec(manifest: GenerationManifest): SpecFile[] {
  return [
    { filename: 'product-spec.md', content: renderProductOverview(manifest) },
    { filename: 'database-schema.sql', content: renderDatabaseSchema(manifest) },
    { filename: 'data-layer.md', content: renderDataLayer(manifest) },
    { filename: 'screens.md', content: renderScreens(manifest) },
    { filename: 'branding.md', content: renderBranding(manifest) },
    { filename: 'upload-rules.md', content: renderUploadRules(manifest) },
  ]
}
```

**Key principle:** Each file is self-contained. Claude Code reads them in parallel when generating the system. No cross-file references needed.

### Pattern 2: NestJS Auth Guard with Clerk (backend)

**What:** Passport-based authentication strategy that verifies Clerk JWTs and extracts roles from publicMetadata.

**When to use:** Every protected endpoint in the generated backend.

```typescript
// backend/src/auth/clerk.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(req: Request) {
    const token = req.headers.authorization?.split(' ').pop();
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });
      // payload.sub = Clerk user ID
      // payload.metadata.role = 'admin' | 'editor' | 'viewer'
      return {
        userId: payload.sub,
        role: (payload as Record<string, unknown>).metadata?.role ?? 'viewer',
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**Source:** Verified pattern from multiple NestJS+Clerk guides and Clerk official docs for manual JWT verification.

### Pattern 3: Brazilian Format Normalization (backend)

**What:** Parse CSV/XLSX files with Brazilian number (1.234,56) and date (dd/mm/yyyy) formats into normalized types.

**When to use:** Upload processing pipeline in the NestJS backend.

```typescript
// backend/src/upload/parsers/br-normalizer.ts

/** Convert Brazilian currency string to number: "1.234,56" -> 1234.56 */
export function parseBRCurrency(value: string): number {
  const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num)) throw new Error(`Invalid BR currency: "${value}"`);
  return num;
}

/** Convert Brazilian date string to ISO date: "25/03/2026" -> "2026-03-25" */
export function parseBRDate(value: string): string {
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) throw new Error(`Invalid BR date: "${value}"`);
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
```

### Pattern 4: Data Aggregation and Formula Evaluation (backend)

**What:** Backend service that executes SQL aggregations for fields and evaluates formula expressions using the resolved field values.

**When to use:** All data endpoints that power KPI cards, charts, and tables.

```typescript
// backend/src/data/data.service.ts (conceptual)

// 1. Fields are resolved via SQL aggregation queries
//    field.aggregation (SUM/COUNT/AVG/MIN/MAX) + field.source (table) + field.column + field.filter
//    -> SELECT SUM(valor_original) FROM contas_a_receber WHERE period_month = $1 AND period_year = $2

// 2. Formulas reference resolved field values
//    formula.expression = "receita_total - custos_variaveis"
//    -> Topologically sort formulas by references
//    -> Evaluate in order, substituting resolved values

// 3. Thresholds map to conditional coloring
//    threshold.levels.verde/amarelo/vermelho applied to formula results
```

**Formula evaluation approach:** Parse the simple arithmetic expressions (only +, -, *, /, field references) with a lightweight evaluator. The expressions in the TechnicalConfig are simple enough (e.g., `receita_total - custos_variaveis`) that a basic token parser suffices -- no need for a full expression engine. Topological sort on the `references` array ensures correct evaluation order.

### Pattern 5: Frontend Protected Routes with Clerk

**What:** React Router layout with Clerk authentication and role-based route protection.

```typescript
// frontend/src/App.tsx
import { ClerkProvider, Show } from '@clerk/react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  return (
    <>
      <Show when="signed-in">
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </Show>
      <Show when="signed-out">
        <Navigate to="/sign-in" />
      </Show>
    </>
  );
}
```

**Source:** Clerk React quickstart docs + react-router-dom v7 protected route patterns.

### Anti-Patterns to Avoid

- **Frontend direct Supabase access:** User explicitly locked this out. ALL data flows through NestJS backend.
- **Monolithic SKILL.md:** User explicitly rejected this. Output must be multi-file product spec.
- **Generic/EAV table structure:** Each report type gets its own typed table with named columns.
- **Re-teaching tools in product spec:** Product spec describes WHAT, not HOW. Claude Code already has global skills for React, NestJS, Clerk, shadcn.
- **Next.js:** User explicitly chose Vite+React for dashboards. No SSR needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XLSX/CSV parsing | Custom parser | SheetJS (`xlsx`) with `read(buffer)` | Edge cases with encodings, merged cells, date serials are enormous |
| File upload handling | Custom multipart parser | NestJS `FileInterceptor` + Multer | Memory management, file type validation, buffer handling |
| JWT verification | Custom JWT decode | `@clerk/backend` `verifyToken()` | Key rotation, clock skew, audience validation handled |
| Data fetching + caching | Custom fetch + useState | TanStack React Query `useQuery`/`useMutation` | Cache invalidation, background refetch, optimistic updates, devtools |
| Component library | Custom form/table/dialog | shadcn/ui | Accessible, consistent, Tailwind-native, same as fxl-core |
| Number formatting (BR) | Custom regex formatter | `Intl.NumberFormat('pt-BR')` | Locale-aware, handles edge cases, browser-native |
| Date formatting (BR) | Custom string manipulation | `Intl.DateTimeFormat('pt-BR')` | Timezone-safe, locale-aware |
| Auth state management | Custom context + fetch | `@clerk/react` hooks (`useUser`, `useSession`, `useAuth`) | Session sync, token refresh, SSO handled |
| Route protection | Custom auth wrapper | Clerk `<Show>` component + react-router-dom `Outlet` | Declarative, handles loading states |

**Key insight:** The generated system is a standard Vite+React+NestJS application. Every piece has a well-established library. The value of FXL's generation is in WHAT gets generated (the specific screens, data bindings, formulas, branding), not in custom infrastructure.

---

## Common Pitfalls

### Pitfall 1: Monolithic Generation Output
**What goes wrong:** Generating one massive file that Claude Code struggles to parse or that mixes concerns.
**Why it happens:** The existing `renderSkillMd()` outputs a single Markdown string.
**How to avoid:** Split into 5-6 focused files with clear boundaries. Each file under 500 lines.
**Warning signs:** A single product spec file exceeding 1000 lines.

### Pitfall 2: Frontend Directly Accessing Supabase
**What goes wrong:** Violates user's explicit decision. Security model breaks because frontend can't enforce business rules.
**Why it happens:** Supabase client-side pattern is well-documented and seems simpler.
**How to avoid:** Frontend ONLY talks to NestJS backend via REST. Backend is the sole Supabase consumer.
**Warning signs:** `@supabase/supabase-js` appearing in frontend package.json.

### Pitfall 3: SheetJS Date Serial Ambiguity
**What goes wrong:** Dates like "03/09/2026" parsed as March 9 (US) instead of September 3 (BR) or vice versa.
**Why it happens:** SheetJS format 14 (m/d/yy) is locale-dependent. Excel stores dates as serial numbers but CSV stores formatted strings.
**How to avoid:** Always use `dateNF: 'dd/mm/yyyy'` option when reading. For CSV, detect format from the ReportType's column mapping (format: 'dd/mm/yyyy') and parse accordingly. Never rely on auto-detection.
**Warning signs:** Date values appearing as 5-digit numbers or wrong month/day order.

### Pitfall 4: Formula Circular Dependencies
**What goes wrong:** Formula A references B, B references A. Evaluation infinite-loops.
**Why it happens:** Complex financial formula chains (DRE has 7+ chained formulas).
**How to avoid:** The existing `config-validator.ts` already detects circular formulas via topological sort. Run validation before generation. In the backend, use the same topological ordering for evaluation.
**Warning signs:** `detectCircularFormulas()` returning `hasCycle: true`.

### Pitfall 5: Clerk Token Expiry in Long Dashboard Sessions
**What goes wrong:** User keeps dashboard open for hours, token expires, API calls start failing silently.
**Why it happens:** Clerk session tokens have 60-second expiry by default; the client SDK handles refresh but the backend request may still fail.
**How to avoid:** Frontend uses `useAuth().getToken()` before each API call (React Query can be configured with a query function that always gets a fresh token). Backend returns 401 consistently. Frontend React Query handles 401 by redirecting to sign-in.
**Warning signs:** Intermittent 401 errors after idle periods.

### Pitfall 6: Git Submodule Complexity
**What goes wrong:** Operator clones fxl-core but submodules are empty. Client repo changes not tracked properly.
**Why it happens:** Git submodules require explicit `git submodule init && git submodule update` after clone.
**How to avoid:** Document the workflow clearly. Use `git clone --recurse-submodules`. The semi-automatic flow (operator opens Claude Code in client repo) means the submodule link is mostly for organizational visibility, not daily workflow.
**Warning signs:** Empty client repo directories after fresh clone.

### Pitfall 7: BR Number Format in CSV Upload
**What goes wrong:** "1.234,56" parsed as 1.234 (truncated) instead of 1234.56.
**Why it happens:** Default number parsers assume US format (comma = thousands, dot = decimal).
**How to avoid:** BR normalizer function that strips dots (thousands), replaces comma with dot (decimal), then parseFloat. Apply this per-column based on the column mapping's `format: '1.234,56'` flag.
**Warning signs:** Financial values appearing 1000x smaller than expected.

---

## Code Examples

### Product Spec File: product-spec.md (generated output format)

```markdown
# Product Spec -- [Client Label] BI Dashboard

## System Identity
- Client: [clientLabel]
- Slug: [clientSlug]
- Type: Dashboard BI

## Navigation (Sidebar)
| Screen | Icon | Period Type |
|--------|------|-------------|
| Resultado Mensal / DFC | calculator | mensal |
| Visao por Receita | trending-up | mensal |
...

## Auth Roles
| Role | Screens | Upload | Settings | User Management |
|------|---------|--------|----------|-----------------|
| admin | All | Yes | Yes | Yes |
| editor | All | Yes | No | No |
| viewer | All except Upload/Settings | No | No | No |

## API Endpoints (backend)
| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | /api/data/:screenId | Screen data with period filter | all |
| POST | /api/upload/:reportType | File upload + parse | admin, editor |
| GET | /api/settings/:tableId | Read settings | all |
| PUT | /api/settings/:tableId/:rowId | Update setting row | admin |
...
```

### NestJS Upload Controller with SheetJS

```typescript
// Source: SheetJS NestJS docs + verified pattern
import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { read, utils } from 'xlsx';

@Controller('api/upload')
export class UploadController {
  @Post(':reportType')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { periodMonth: string; periodYear: string },
  ) {
    const wb = read(file.buffer, { dateNF: 'dd/mm/yyyy' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet);
    // -> normalize BR formats per column mapping
    // -> validate against schema
    // -> insert into Supabase
    return { parsed: rows.length, status: 'ok' };
  }
}
```

### Frontend API Client with Token Injection

```typescript
// frontend/src/lib/api-client.ts
import { useAuth } from '@clerk/react';

export function useApiClient() {
  const { getToken } = useAuth();

  async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  return { fetchApi };
}
```

### Clerk RBAC via publicMetadata (backend role check)

```typescript
// backend/src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export type Role = 'admin' | 'editor' | 'viewer';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// backend/src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**Source:** Clerk publicMetadata RBAC guide + NestJS authorization docs.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@clerk/clerk-react` (Core 2) | `@clerk/react` (Current SDK) | v7+ | Package name changed, `<Show>` replaces `<Protect>` |
| `renderSkillMd()` single file | Multi-file product spec | This phase | Needed for Claude Code to consume efficiently |
| react-router-dom v6 | react-router-dom v7 | 2025 | Unified route declarations, better type safety |
| TanStack Query v4 | TanStack Query v5 | 2024 | Single object API for hooks, suspense support |
| SheetJS xlsx v0.18 | xlsx v0.20.x | 2024 | Better date handling, ESM support |
| NestJS v9 | NestJS v10.x | 2023 | SWC builder, better ESM support |

**Deprecated/outdated:**
- `@clerk/clerk-react`: Use `@clerk/react` instead (Core 2 naming)
- `<Protect>` component: Replaced by `<Show>` in current Clerk SDK
- Supabase Auth in Clerk apps: FXL already migrated to Clerk; generated apps use Clerk from start
- `renderSkillMd()` current form: Needs refactoring to multi-file output

---

## Existing Code to Reuse/Adapt

### Direct Reuse (no changes needed)
| Asset | Path | How Used in Phase 6 |
|-------|------|---------------------|
| `GenerationManifest` type | `tools/wireframe-builder/types/generation.ts` | Input type for product spec generator |
| `TechnicalConfig` types | `tools/wireframe-builder/types/technical.ts` | Schema for data layer, bindings, formulas |
| `BrandingConfig` type | `tools/wireframe-builder/types/branding.ts` | Branding tokens for product spec |
| `BlueprintConfig` types | `tools/wireframe-builder/types/blueprint.ts` | Screen/section definitions |
| `resolveConfig()` | `tools/wireframe-builder/lib/config-resolver.ts` | Produces GenerationManifest from 3 configs |
| `validateConfig()` | `tools/wireframe-builder/lib/config-validator.ts` | Pre-generation validation gate |
| Pilot client configs | `clients/financeiro-conta-azul/wireframe/*.config.ts` | Test data for generation |

### Needs Adaptation
| Asset | Path | What Changes |
|-------|------|-------------|
| `renderSkillMd()` | `tools/wireframe-builder/lib/skill-renderer.ts` | Refactor into `generateProductSpec()` that outputs multiple files instead of one string |
| `renderStack()` | Inside skill-renderer.ts | Update from Next.js to Vite+React+NestJS |
| `renderSupabaseSchema()` | Inside skill-renderer.ts | Extract as standalone SQL file generator |
| `renderImplementationRules()` | Inside skill-renderer.ts | Remove (global skills handle this) or slim down to client-specific rules only |

---

## Open Questions

1. **Deploy strategy for generated projects**
   - What we know: Frontend (Vite) deploys well on Vercel. Backend (NestJS) needs a Node.js host.
   - What's unclear: Railway vs Render vs Fly.io for NestJS backend. Supabase project per client vs shared project with schemas.
   - Recommendation: Use Vercel for frontend, Railway for backend. One Supabase project per client (simpler isolation). Mark as Claude's discretion; document in product spec but don't automate deploy in v1.

2. **Formula evaluation complexity ceiling**
   - What we know: Current formulas are simple arithmetic (+-*/) with field references. Topological sort resolves order.
   - What's unclear: Will future clients need conditional logic (IF), date functions, or aggregation windows?
   - Recommendation: Build the simple evaluator now (arithmetic + field substitution). Design it to be extensible but don't over-engineer. The formula `expression` field is already a string -- future expressions can grow in complexity.

3. **Template repo initialization workflow**
   - What we know: Operator clones template, runs product spec generator, opens Claude Code.
   - What's unclear: Exact CLI commands. Whether to use `gh repo create --template` or manual clone.
   - Recommendation: Document a simple `git clone` + copy `.product-spec/` + run `npm install` workflow. Don't build CLI tooling for v1.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (not yet installed -- Wave 0 gap) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SGEN-01 | generateProductSpec() produces expected file set from GenerationManifest | unit | `npx vitest run tools/wireframe-builder/lib/spec-generator.test.ts -t "generates all spec files"` | Wave 0 |
| SGEN-01 | Product spec SQL matches Supabase schema from GenerationManifest | unit | `npx vitest run tools/wireframe-builder/lib/spec-generator.test.ts -t "database schema"` | Wave 0 |
| SGEN-02 | screens.md output contains all blueprint screens with section bindings | unit | `npx vitest run tools/wireframe-builder/lib/spec-generator.test.ts -t "screens"` | Wave 0 |
| SGEN-03 | BR format normalizer correctly converts "1.234,56" to 1234.56 and "25/03/2026" to "2026-03-25" | unit | `npx vitest run tools/wireframe-builder/lib/br-normalizer.test.ts` | Wave 0 |
| SGEN-04 | Product spec includes Clerk role definitions (admin, editor, viewer) | unit | `npx vitest run tools/wireframe-builder/lib/spec-generator.test.ts -t "auth roles"` | Wave 0 |
| SGEN-05 | branding.md output contains CSS variables and font configuration | unit | `npx vitest run tools/wireframe-builder/lib/spec-generator.test.ts -t "branding"` | Wave 0 |
| SGEN-01 | Template repo scaffold starts with npm run dev (frontend + backend) | manual-only | Operator verifies after clone | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest` + `@vitest/ui` -- install as devDependencies
- [ ] `vitest.config.ts` -- root config with TypeScript path aliases matching tsconfig
- [ ] `tools/wireframe-builder/lib/spec-generator.test.ts` -- covers SGEN-01, SGEN-02, SGEN-04, SGEN-05
- [ ] `tools/wireframe-builder/lib/br-normalizer.test.ts` -- covers SGEN-03

---

## Sources

### Primary (HIGH confidence)
- Clerk React quickstart: https://clerk.com/docs/react/getting-started/quickstart -- Setup, ClerkProvider, Show component
- Clerk Basic RBAC guide: https://clerk.com/docs/guides/secure/basic-rbac -- publicMetadata roles pattern
- Clerk verifyToken: https://clerk.com/docs/reference/backend/verify-token -- Backend JWT verification
- SheetJS NestJS docs: https://docs.sheetjs.com/docs/demos/net/server/nestjs/ -- FileInterceptor + read(buffer) pattern
- SheetJS date formats: https://docs.sheetjs.com/docs/csf/features/dates/ -- dateNF option for BR dates
- SheetJS number formats: https://docs.sheetjs.com/docs/csf/features/nf/ -- Format handling

### Secondary (MEDIUM confidence)
- NestJS + Clerk integration: https://dev.to/thedammyking/authentication-with-clerk-in-nestjs-server-application-gpm -- Passport strategy pattern, verified with Clerk docs
- NestJS + Supabase setup: https://blog.andriishupta.dev/setup-supabase-with-nestjs -- Module pattern, verified with @supabase/supabase-js docs
- NestJS file upload in-memory: https://dev.to/damir_maham/streamline-file-uploads-in-nestjs-efficient-in-memory-parsing-for-csv-xlsx-without-disk-storage-145g -- In-memory parsing pattern
- React Router v7 protected routes: https://dev.to/ra1nbow1/building-reliable-protected-routes-with-react-router-v7-1ka0 -- Layout + Outlet pattern
- TanStack Query v5 overview: https://tanstack.com/query/v5/docs/framework/react/overview -- Hooks API, caching patterns

### Tertiary (LOW confidence)
- Deploy strategy (Vercel + Railway): General knowledge, not verified with specific pricing/limits for generated NestJS apps

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs, compatible with fxl-core existing stack
- Architecture: HIGH - Template + product spec pattern directly follows user decisions from CONTEXT.md
- Pitfalls: HIGH - SheetJS date/number issues well-documented; Clerk token patterns verified
- Product spec structure: MEDIUM - Claude's discretion area; recommended structure based on analysis of GenerationManifest shape
- Formula evaluation: MEDIUM - Simple arithmetic evaluator sufficient for pilot client formulas; extensibility uncertain

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (30 days -- stable ecosystem, no fast-moving dependencies)
