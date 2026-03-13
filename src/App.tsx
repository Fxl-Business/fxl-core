import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, RouteObject, Routes } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import WireframeViewer from '@/pages/clients/WireframeViewer'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import { Toaster } from '@/components/ui/sonner'
import { MODULE_REGISTRY } from '@/modules/registry'

const SharedWireframeView = lazy(() => import('@/pages/SharedWireframeView'))

const moduleRoutes = MODULE_REGISTRY
  .flatMap(m => m.routeConfig ?? [])
  .filter((cfg): cfg is RouteObject & { path: string } => cfg.path !== undefined)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected operator routes (inside Layout) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Module routes — derived from MODULE_REGISTRY manifests */}
          {moduleRoutes.map(cfg => (
            <Route key={cfg.path} path={cfg.path} element={cfg.element} />
          ))}
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
    </BrowserRouter>
  )
}
