import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import Layout from '@platform/layout/Layout'
import ProtectedRoute from '@platform/auth/ProtectedRoute'
import SuperAdminRoute from '@platform/auth/SuperAdminRoute'
import Home from '@platform/pages/Home'
import Login from '@platform/auth/Login'
import Profile from '@platform/auth/Profile'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import WireframeViewer from '@modules/clients/pages/WireframeViewer'

const SharedWireframeView = lazy(() => import('@modules/wireframe/pages/SharedWireframeView'))

// Admin pages (lazy for code splitting)
const ModulesPanel = lazy(() => import('@platform/pages/admin/ModulesPanel'))
const ConnectorsPanel = lazy(() => import('@platform/pages/admin/ConnectorsPanel'))

// Tasks pages — TaskList is non-lazy (lightweight); KanbanBoard and TaskForm are lazy
import TaskList from '@modules/tasks/pages/TaskList'
const KanbanBoard = lazy(() => import('@modules/tasks/pages/KanbanBoard'))
const TaskForm = lazy(() => import('@modules/tasks/pages/TaskForm'))

const moduleRoutes = MODULE_REGISTRY
  .flatMap(m => m.routeConfig ?? [])
  .filter((cfg): cfg is RouteObject & { path: string } => cfg.path !== undefined)

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

      {/* Admin routes — protected by ProtectedRoute + SuperAdminRoute */}
      <Route element={<ProtectedRoute><SuperAdminRoute><Layout /></SuperAdminRoute></ProtectedRoute>}>
        <Route
          path="/admin/modules"
          element={<Suspense fallback={<div>Carregando...</div>}><ModulesPanel /></Suspense>}
        />
        <Route
          path="/admin/connectors"
          element={<Suspense fallback={<div>Carregando...</div>}><ConnectorsPanel /></Suspense>}
        />
      </Route>

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
