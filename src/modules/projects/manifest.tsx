import { FolderKanban } from 'lucide-react'
import ProjectsIndex from './pages/ProjectsIndex'
import ProjectIndex from './pages/ProjectIndex'
import ProjectDocViewer from './pages/ProjectDocViewer'
import BlueprintTextView from './pages/BlueprintTextView'
import BriefingForm from './pages/BriefingForm'
import WireframeViewer from './pages/WireframeViewer'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import { useProjectsNav } from './hooks/useProjectsNav'

export const projectsManifest: ModuleDefinition = {
  id: MODULE_IDS.PROJECTS,
  description: 'Workspaces de projetos com docs, briefing, blueprint e wireframe.',
  tenantScoped: true,
  label: 'Projetos',
  route: '/projetos',
  icon: FolderKanban,
  status: 'active',
  useNavItems: useProjectsNav,
  // navChildren are now dynamic — built by useProjectsNav hook and injected in Sidebar.tsx
  navChildren: [],
  routeConfig: [
    { path: '/projetos', element: <ProjectsIndex /> },
    { path: '/projetos/:projectSlug', element: <ProjectIndex /> },
    { path: '/projetos/:projectSlug/briefing', element: <BriefingForm /> },
    { path: '/projetos/:projectSlug/blueprint', element: <BlueprintTextView /> },
    { path: '/projetos/:projectSlug/wireframe', element: <WireframeViewer /> },
    { path: '/projetos/:projectSlug/:doc', element: <ProjectDocViewer /> },
  ],
}
