import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, RouteObject, Routes } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import Layout from '@platform/layout/Layout'
import ProtectedRoute from '@platform/auth/ProtectedRoute'
import Home from '@platform/pages/Home'
import WireframeViewer from '@modules/clients/pages/WireframeViewer'
import Login from '@platform/auth/Login'
import Profile from '@platform/auth/Profile'
import { Toaster } from '@shared/ui/sonner'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import { ModuleEnabledProvider } from '@platform/module-loader/hooks/useModuleEnabled'
import { ExtensionProvider } from '@platform/module-loader/slots'

const SharedWireframeView = lazy(() => import('@modules/wireframe/pages/SharedWireframeView'))

// Admin pages (lazy for code splitting)
const ModulesPanel = lazy(() => import('@platform/pages/admin/ModulesPanel'))

// Knowledge Base pages (lazy for code splitting)
const KBListPage = lazy(() => import('@/modules/knowledge-base/pages/KBListPage'))
const KBDetailPage = lazy(() => import('@/modules/knowledge-base/pages/KBDetailPage'))
const KBFormPage = lazy(() => import('@/modules/knowledge-base/pages/KBFormPage'))
const KBSearchPage = lazy(() => import('@/modules/knowledge-base/pages/KBSearchPage'))

// Tasks pages — TaskList is non-lazy (lightweight); KanbanBoard and TaskForm are lazy (Plan 02/03)
import TaskList from '@/modules/tasks/pages/TaskList'
const KanbanBoard = lazy(() => import('@/modules/tasks/pages/KanbanBoard'))
const TaskForm = lazy(() => import('@/modules/tasks/pages/TaskForm'))

const moduleRoutes = MODULE_REGISTRY
  .flatMap(m => m.routeConfig ?? [])
  .filter((cfg): cfg is RouteObject & { path: string } => cfg.path !== undefined)

export default function App() {
  return (
    <BrowserRouter>
      <ModuleEnabledProvider>
        <ExtensionProvider>
          <Routes>
            {/* Protected operator routes (inside Layout) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Module routes — derived from MODULE_REGISTRY manifests */}
              {moduleRoutes.map(cfg => (
                <Route key={cfg.path} path={cfg.path} element={cfg.element} />
              ))}

              {/* Knowledge Base — static routes before parametric (RESEARCH pitfall 3) */}
              <Route path="/knowledge-base" element={<Suspense fallback={<div>Carregando...</div>}><KBListPage /></Suspense>} />
              <Route path="/knowledge-base/search" element={<Suspense fallback={<div>Carregando...</div>}><KBSearchPage /></Suspense>} />
              <Route path="/knowledge-base/new" element={<Suspense fallback={<div>Carregando...</div>}><KBFormPage /></Suspense>} />
              <Route path="/knowledge-base/:id/edit" element={<Suspense fallback={<div>Carregando...</div>}><KBFormPage /></Suspense>} />
              <Route path="/knowledge-base/:id" element={<Suspense fallback={<div>Carregando...</div>}><KBDetailPage /></Suspense>} />

              {/* Tasks — static routes before parametric */}
              <Route path="/tarefas" element={<TaskList />} />
              <Route path="/tarefas/kanban" element={<Suspense fallback={<div>Carregando...</div>}><KanbanBoard /></Suspense>} />
              <Route path="/tarefas/new" element={<Suspense fallback={<div>Carregando...</div>}><TaskForm /></Suspense>} />
              <Route path="/tarefas/:id/edit" element={<Suspense fallback={<div>Carregando...</div>}><TaskForm /></Suspense>} />

              {/* Admin routes — static, not in MODULE_REGISTRY, not in sidebar */}
              <Route
                path="/admin/modules"
                element={<Suspense fallback={<div>Carregando...</div>}><ModulesPanel /></Suspense>}
              />
            </Route>

            {/* Auth pages — public, full screen */}
            <Route path="/login/*" element={<Login />} />
            <Route
              path="/signup/*"
              element={
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 dark:bg-background">
                  <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Nucleo FXL</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Crie sua conta</p>
                  </div>
                  <SignUp routing="path" path="/signup" signInUrl="/login" />
                </div>
              }
            />

            {/* Profile — protected, full screen */}
            <Route
              path="/perfil/*"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />

            {/* Wireframe viewer — protected, full screen (static route beats /:doc wildcard) */}
            <Route
              path="/clients/financeiro-conta-azul/wireframe"
              element={<ProtectedRoute><WireframeViewer clientSlug="financeiro-conta-azul" /></ProtectedRoute>}
            />
            {/* Parametric fallback for other clients */}
            <Route
              path="/clients/:clientSlug/wireframe"
              element={<ProtectedRoute><WireframeViewer /></ProtectedRoute>}
            />

            {/* Redirect old wireframe-view route to new parametric route */}
            <Route
              path="/clients/financeiro-conta-azul/wireframe-view"
              element={<Navigate to="/clients/financeiro-conta-azul/wireframe" replace />}
            />

            {/* Shared wireframe viewer for external clients (token-gated, public) */}
            <Route
              path="/wireframe-view"
              element={
                <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>}>
                  <SharedWireframeView />
                </Suspense>
              }
            />
          </Routes>
          <Toaster />
        </ExtensionProvider>
      </ModuleEnabledProvider>
    </BrowserRouter>
  )
}
