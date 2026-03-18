import { BookOpen } from 'lucide-react'
import DocRenderer from './pages/DocRenderer'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import { useDocsNavItems } from './hooks/useDocsNavItems'

export const docsManifest: ModuleDefinition = {
  id: MODULE_IDS.DOCS,
  description: 'Processo, ferramentas e padroes tecnicos da FXL.',
  tenantScoped: true,
  label: 'Processo',
  route: '/processo/index',
  icon: BookOpen,
  status: 'active',
  useNavItems: useDocsNavItems,
  navChildren: [
    {
      label: 'Processo',
      href: '/processo/index',
      children: [
        { label: 'Visao Geral', href: '/processo/visao-geral' },
        { label: 'Prompts', href: '/processo/prompts' },
        { label: 'Cliente vs Produto', href: '/processo/cliente-vs-produto' },
        { label: 'Identidade FXL', href: '/processo/identidade' },
        {
          label: 'Fases',
          href: '/processo/fases/index',
          children: [
            { label: 'Fase 1 — Diagnostico', href: '/processo/fases/fase1' },
            { label: 'Fase 2 — Wireframe', href: '/processo/fases/fase2' },
            { label: 'Fase 3 — Desenvolvimento', href: '/processo/fases/fase3' },
            { label: 'Fase 4 — Auditoria', href: '/processo/fases/fase4' },
            { label: 'Fase 5 — Entrega', href: '/processo/fases/fase5' },
            { label: 'Fase 6 — Tutorial', href: '/processo/fases/fase6' },
          ],
        },
        { label: 'Onboarding', href: '/processo/onboarding' },
      ],
    },
    {
      label: 'Padroes',
      href: '/padroes/index',
      children: [
        {
          label: 'Tech Radar',
          href: '/ferramentas/tech-radar',
          children: [
            { label: 'Vite + React + TS', href: '/ferramentas/techs/vite-react-ts' },
            { label: 'Tailwind + shadcn/ui', href: '/ferramentas/techs/tailwind-shadcn' },
            { label: 'Next.js', href: '/ferramentas/techs/nextjs' },
            { label: 'Supabase', href: '/ferramentas/techs/supabase' },
            { label: 'Vercel', href: '/ferramentas/techs/vercel' },
            { label: 'GitHub', href: '/ferramentas/techs/github' },
            { label: 'GitHub Actions', href: '/ferramentas/techs/github-actions' },
            { label: 'Backend — Node.js', href: '/ferramentas/techs/backend-node' },
            { label: 'Backend — Python', href: '/ferramentas/techs/backend-python' },
            { label: 'Docker', href: '/ferramentas/techs/docker' },
            { label: 'Kubernetes', href: '/ferramentas/techs/kubernetes' },
            { label: 'Terraform', href: '/ferramentas/techs/terraform' },
            { label: 'API Gateway', href: '/ferramentas/techs/api-gateway' },
            { label: 'Kafka', href: '/ferramentas/techs/kafka' },
            { label: 'Keycloak', href: '/ferramentas/techs/keycloak' },
          ],
        },
        { label: 'Premissas Gerais', href: '/ferramentas/premissas-gerais' },
        { label: 'Seguranca', href: '/ferramentas/seguranca' },
        { label: 'Testes', href: '/ferramentas/testes' },
      ],
    },
  ],
  routeConfig: [
    { path: '/processo/*', element: <DocRenderer /> },
    { path: '/referencias/*', element: <DocRenderer /> },
    { path: '/padroes/*', element: <DocRenderer /> },
    { path: '/ferramentas/*', element: <DocRenderer /> },
    { path: '/sdk/*', element: <DocRenderer /> },
  ],
}
