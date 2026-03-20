import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { SignUp, useAuth, RedirectToSignIn, AuthenticateWithRedirectCallback } from '@clerk/react'
import Layout from '@platform/layout/Layout'
import ProtectedRoute from '@platform/auth/ProtectedRoute'
import SuperAdminRoute from '@platform/auth/SuperAdminRoute'
import Home from '@platform/pages/Home'
import SolicitarAcesso from '@platform/pages/SolicitarAcesso'
import Login from '@platform/auth/Login'
import Profile from '@platform/auth/Profile'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import { ModuleErrorBoundary } from '@platform/layout/ModuleErrorBoundary'
import WireframeViewer from '@modules/projects/pages/WireframeViewer'

const SharedWireframeView = lazy(() => import('@modules/wireframe/pages/SharedWireframeView'))

// Admin pages (lazy for code splitting)
const AdminLayout = lazy(() => import('@platform/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('@platform/pages/admin/AdminDashboard'))
const TenantsPage = lazy(() => import('@platform/pages/admin/TenantsPage'))
const TenantDetailPage = lazy(() => import('@platform/pages/admin/TenantDetailPage'))
const ModulesPanel = lazy(() => import('@platform/pages/admin/ModulesPanel'))
const ConnectorsPanel = lazy(() => import('@platform/pages/admin/ConnectorsPanel'))
const SettingsPanel = lazy(() => import('@platform/pages/admin/SettingsPanel'))
const ProductDocsPage = lazy(() => import('@platform/pages/admin/ProductDocsPage'))
const UsersPage = lazy(() => import('@platform/pages/admin/UsersPage'))

// Tasks pages — TaskList is non-lazy (lightweight); KanbanBoard and TaskForm are lazy
import TaskList from '@modules/tasks/pages/TaskList'
const KanbanBoard = lazy(() => import('@modules/tasks/pages/KanbanBoard'))
const TaskForm = lazy(() => import('@modules/tasks/pages/TaskForm'))

// Thin auth-only guard: checks isSignedIn only, NOT org membership.
// Used for routes that must be accessible to signed-in users without an org (e.g. /solicitar-acesso).
function AuthOnlyRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ fontSize: 14, color: '#757575' }}>Carregando...</p>
      </div>
    )
  }
  if (!isSignedIn) return <RedirectToSignIn />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Wireframe viewer — protected, full screen (MUST be before Layout group
           to avoid /projetos/:projectSlug/:doc catching the URL) */}
      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
        <Route
          path="/projetos/:projectSlug/wireframe"
          element={<ModuleErrorBoundary moduleName="Wireframe"><WireframeViewer /></ModuleErrorBoundary>}
        />
      </Route>

      {/* Protected operator routes (inside Layout) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Home */}
        <Route path="/" element={<ModuleErrorBoundary moduleName="Home"><Home /></ModuleErrorBoundary>} />

        {/* Module routes — derived from MODULE_REGISTRY manifests, each wrapped with error boundary */}
        {MODULE_REGISTRY.map(m => {
          const routes = (m.routeConfig ?? []).filter(
            (cfg): cfg is RouteObject & { path: string } => cfg.path !== undefined,
          )
          if (routes.length === 0) return null
          return routes.map(cfg => (
            <Route
              key={cfg.path}
              path={cfg.path}
              element={
                <ModuleErrorBoundary moduleName={m.label}>
                  {cfg.element}
                </ModuleErrorBoundary>
              }
            />
          ))
        })}

        {/* Tasks — static routes before parametric */}
        <Route path="/tarefas" element={<ModuleErrorBoundary moduleName="Tarefas"><TaskList /></ModuleErrorBoundary>} />
        <Route path="/tarefas/kanban" element={<ModuleErrorBoundary moduleName="Tarefas"><Suspense fallback={<div>Carregando...</div>}><KanbanBoard /></Suspense></ModuleErrorBoundary>} />
        <Route path="/tarefas/new" element={<ModuleErrorBoundary moduleName="Tarefas"><Suspense fallback={<div>Carregando...</div>}><TaskForm /></Suspense></ModuleErrorBoundary>} />
        <Route path="/tarefas/:id/edit" element={<ModuleErrorBoundary moduleName="Tarefas"><Suspense fallback={<div>Carregando...</div>}><TaskForm /></Suspense></ModuleErrorBoundary>} />

      </Route>

      {/* Admin routes — SuperAdminRoute + AdminLayout */}
      <Route element={
        <SuperAdminRoute>
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>}>
            <AdminLayout />
          </Suspense>
        </SuperAdminRoute>
      }>
        <Route path="/admin" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><AdminDashboard /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/users" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><UsersPage /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/tenants" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><TenantsPage /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/tenants/:orgId" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><TenantDetailPage /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/modules" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><ModulesPanel /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/connectors" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><ConnectorsPanel /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/product-docs" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><ProductDocsPage /></Suspense></ModuleErrorBoundary>} />
        <Route path="/admin/settings" element={<ModuleErrorBoundary moduleName="Admin"><Suspense fallback={<div>Carregando...</div>}><SettingsPanel /></Suspense></ModuleErrorBoundary>} />
      </Route>

      {/* SSO callback for OAuth redirect (Google login) */}
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />

      {/* Auth pages — public, full screen */}
      <Route path="/login/*" element={<Login />} />
      <Route
        path="/signup/*"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 dark:bg-background">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Nexo</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Crie sua conta</p>
            </div>
            <SignUp routing="path" path="/signup" signInUrl="/login" />
          </div>
        }
      />

      {/* Request access — auth required but no-org-required (avoids ProtectedRoute redirect loop) */}
      <Route
        path="/solicitar-acesso"
        element={
          <AuthOnlyRoute>
            <SolicitarAcesso />
          </AuthOnlyRoute>
        }
      />

      {/* Profile — protected, full screen */}
      <Route
        path="/perfil/*"
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />

      {/* Redirect old wireframe-view route to new parametric route */}
      <Route
        path="/clients/financeiro-conta-azul/wireframe-view"
        element={<Navigate to="/projetos/financeiro-conta-azul/wireframe" replace />}
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
  )
}
