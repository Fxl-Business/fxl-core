---
title: Stack Aprovada
badge: SDK
description: Tecnologias, versoes e decisoes tecnicas para projetos spoke
scope: product
sort_order: 20
---

# Stack Aprovada

Todo projeto spoke da FXL usa a mesma stack base. Desvios so sao permitidos com aprovacao explicita.

## Tabela de Tecnologias

| Camada | Tecnologia | Versao | Obrigatorio |
|--------|-----------|--------|-------------|
| Framework | React | 18.x | Sim |
| Linguagem | TypeScript | 5.x (strict: true) | Sim |
| Estilo | Tailwind CSS | 3.x | Sim |
| Componentes | shadcn/ui | latest | Sim |
| Build | Vite | 5.x | Sim |
| Banco de dados | Supabase | @supabase/supabase-js 2.x | Sim |
| Autenticacao | Clerk | @clerk/react 6.x | Sim |
| Icones | lucide-react | latest | Sim |
| Deploy | Vercel | -- | Sim |
| CI | GitHub Actions | -- | Sim |
| Validacao | Zod | latest | Recomendado |

## Versoes Pinadas

As versoes acima sao pinadas por major version. Isso garante:

- **Compatibilidade** entre projetos spoke e o Hub
- **Previsibilidade** ao rodar audits e checklists automatizados
- **Estabilidade** ao copiar templates entre projetos

{% callout type="warning" %}
Nunca atualizar uma major version sem testar todos os checklists (`fxl-doctor.sh`). Upgrades de major version devem ser coordenados entre todos os spokes ativos.
{% /callout %}

## Decisoes Tecnicas

### Por que Vite e nao Next.js?

Spokes da FXL sao aplicacoes SPA (Single Page Application) que se conectam ao Hub via API contract. Nao precisam de SSR (Server-Side Rendering) nem de rotas de API nativas do framework.

**Quando usar Vite (padrao):**
- SPAs com roteamento client-side
- Projetos que consomem Supabase diretamente via client SDK
- Dashboards, paineis de gestao, ferramentas internas

**Quando considerar Next.js:**
- Projeto precisa de SEO (landing pages publicas)
- Projeto precisa de API routes server-side pesadas
- Projeto precisa de SSR ou ISR para performance

{% callout type="info" %}
Se o projeto precisa de Next.js, usar App Router (nao Pages Router). As mesmas regras de TypeScript strict, shadcn/ui e Supabase se aplicam.
{% /callout %}

### Por que Clerk?

Clerk e o provider de autenticacao compartilhado entre Hub e spokes. Cada spoke tem sua propria instancia Clerk (independente do Hub), mas usa a mesma infraestrutura.

Vantagens:
- SDK React nativo com hooks (`useAuth`, `useUser`, `useOrganization`)
- Google OAuth e SSO enterprise prontos
- JWT com claims customizaveis (incluindo `org_id`)
- Multi-tenancy nativo via Organizations

### Por que Supabase?

Supabase fornece banco de dados PostgreSQL com RLS (Row Level Security) nativo, o que permite isolamento de dados por `org_id` sem logica de aplicacao adicional.

Vantagens:
- PostgreSQL completo com migrations versionadas
- RLS para isolamento multi-tenant automatico
- Client SDK leve para queries diretas do browser
- Realtime subscriptions quando necessario

### Por que shadcn/ui?

shadcn/ui fornece componentes acessiveis e customizaveis que sao copiados para o projeto (nao instalados como dependencia).

Vantagens:
- Componentes sao donos do projeto (customizacao total)
- Baseado em Radix UI (acessibilidade garantida)
- Estilizacao via Tailwind CSS (consistente com o resto do projeto)
- Sem lock-in de versao de biblioteca

## Dependencias Obrigatorias

Instalacao base para todo spoke:

```bash
# Core
npm install @supabase/supabase-js@2 @clerk/react@6 lucide-react zod

# UI
npm install tailwindcss@3 postcss autoprefixer
npm install -D @types/node

# shadcn/ui
npx shadcn@latest init
```

## Dependencias Opcionais

| Dependencia | Quando usar |
|-------------|------------|
| `recharts` | Graficos e dashboards |
| `react-router-dom` | Roteamento SPA |
| `@tanstack/react-query` | Cache de dados server-side |
| `date-fns` | Manipulacao de datas |
| `react-hook-form` | Formularios complexos |

{% callout type="warning" %}
Toda dependencia adicionada deve ser documentada no `CLAUDE.md` do spoke. Nunca adicionar dependencias silenciosamente.
{% /callout %}

## Variaveis de Ambiente

Variaveis obrigatorias para todo spoke:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
FXL_API_KEY=<chave-gerada>            # server-side only, SEM prefixo VITE_
```

- Prefixo `VITE_` expoe a variavel ao browser (Vite injeta no bundle)
- Secrets de servidor (service role key, API keys) **nunca** levam prefixo `VITE_`
- `.env.local` nunca e commitado — `.env.example` sim
