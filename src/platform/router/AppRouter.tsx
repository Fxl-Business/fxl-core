import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { SignUp, useAuth, RedirectToSignIn, AuthenticateWithRedirectCallback } from '@clerk/react'
import Layout from '@platform/layout/Layout'
import ProtectedRoute from '@platform/auth/ProtectedRoute'
import SuperAdminRoute from '@platform/auth/SuperAdminRoute'
import Home from '@platform/pages/Home'
import CriarEmpresa from '@platform/pages/CriarEmpresa'
import Login from '@platform/auth/Login'
import Profile from '@platform/auth/Profile'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import WireframeViewer from '@modules/clients/pages/WireframeViewer'

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

// Tasks pages — TaskList is non-lazy (lightweight); KanbanBoard and TaskForm are lazy
import TaskList from '@modules/tasks/pages/TaskList'
const KanbanBoard = lazy(() => import('@modules/tasks/pages/KanbanBoard'))
const TaskForm = lazy(() => import('@modules/tasks/pages/TaskForm'))

const moduleRoutes = MODULE_REGISTRY
  .flatMap(m => m.routeConfig ?? [])
  .filter((cfg): cfg is RouteObject & { path: string } => cfg.path !== undefined)

// Thin auth-only guard: checks isSignedIn only, NOT org membership.
// Used for routes that must be accessible to signed-in users without an org (e.g. /criar-empresa).
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
      {/* Protected operator routes (inside Layout) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Module routes — derived from MODULE_REGISTRY manifests */}
        {moduleRoutes.map(cfg => (
          <Route key={cfg.path} path={cfg.path} element={cfg.element} />
        ))}

        {/* Tasks — static routes before parametric */}
        <Route path="/tarefas" element={<TaskList />} />
        <Route path="/tarefas/kanban" element={<Suspense fallback={<div>Carregando...</div>}><KanbanBoard /></Suspense>} />
        <Route path="/tarefas/new" element={<Suspense fallback={<div>Carregando...</div>}><TaskForm /></Suspense>} />
        <Route path="/tarefas/:id/edit" element={<Suspense fallback={<div>Carregando...</div>}><TaskForm /></Suspense>} />

      </Route>

      {/* Admin routes — SuperAdminRoute + AdminLayout */}
      <Route element={
        <SuperAdminRoute>
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>}>
            <AdminLayout />
          </Suspense>
        </SuperAdminRoute>
      }>
        <Route path="/admin" element={<Suspense fallback={<div>Carregando...</div>}><AdminDashboard /></Suspense>} />
        <Route path="/admin/tenants" element={<Suspense fallback={<div>Carregando...</div>}><TenantsPage /></Suspense>} />
        <Route path="/admin/tenants/:orgId" element={<Suspense fallback={<div>Carregando...</div>}><TenantDetailPage /></Suspense>} />
        <Route path="/admin/modules" element={<Suspense fallback={<div>Carregando...</div>}><ModulesPanel /></Suspense>} />
        <Route path="/admin/connectors" element={<Suspense fallback={<div>Carregando...</div>}><ConnectorsPanel /></Suspense>} />
        <Route path="/admin/product-docs" element={<Suspense fallback={<div>Carregando...</div>}><ProductDocsPage /></Suspense>} />
        <Route path="/admin/settings" element={<Suspense fallback={<div>Carregando...</div>}><SettingsPanel /></Suspense>} />
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

      {/* Onboarding — auth required but no-org-required (avoids ProtectedRoute redirect loop) */}
      <Route
        path="/criar-empresa"
        element={
          <AuthOnlyRoute>
            <CriarEmpresa />
          </AuthOnlyRoute>
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
  )
}
