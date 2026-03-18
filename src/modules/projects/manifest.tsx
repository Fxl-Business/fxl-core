import { FolderKanban } from 'lucide-react'
import ProjectsIndex from './pages/ProjectsIndex'
import ProjectIndex from './pages/ProjectIndex'
import ProjectDocViewer from './pages/ProjectDocViewer'
import BlueprintTextView from './pages/BlueprintTextView'
import BriefingForm from './pages/BriefingForm'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'

export const projectsManifest: ModuleDefinition = {
  id: MODULE_IDS.PROJECTS,
  description: 'Workspaces de projetos com docs, briefing, blueprint e wireframe.',
  tenantScoped: true,
  label: 'Projetos',
  route: '/projetos',
  icon: FolderKanban,
  status: 'active',
  navChildren: [
    {
      label: 'Projetos',
      href: '/projetos',
      children: [
        {
          label: 'Financeiro Conta Azul',
          href: '/projetos/financeiro-conta-azul',
          children: [
            { label: 'Briefing', href: '/projetos/financeiro-conta-azul/briefing' },
            { label: 'Blueprint', href: '/projetos/financeiro-conta-azul/blueprint' },
            { label: 'Wireframe', href: '/projetos/financeiro-conta-azul/wireframe' },
            { label: 'Branding', href: '/projetos/financeiro-conta-azul/branding' },
            { label: 'Changelog', href: '/projetos/financeiro-conta-azul/changelog' },
          ],
        },
      ],
    },
  ],
  routeConfig: [
    { path: '/projetos', element: <ProjectsIndex /> },
    { path: '/projetos/:projectSlug', element: <ProjectIndex /> },
    { path: '/projetos/:projectSlug/briefing', element: <BriefingForm /> },
    { path: '/projetos/:projectSlug/blueprint', element: <BlueprintTextView /> },
    { path: '/projetos/:projectSlug/:doc', element: <ProjectDocViewer /> },
  ],
}
