import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import DocRenderer from '@/pages/DocRenderer'
import FinanceiroIndex from '@/pages/clients/FinanceiroContaAzul/Index'
import FinanceiroDocViewer from '@/pages/clients/FinanceiroContaAzul/DocViewer'
import BlueprintTextView from '@/pages/clients/BlueprintTextView'
import BriefingForm from '@/pages/clients/BriefingForm'
import WireframeViewer from '@/pages/clients/WireframeViewer'
import ComponentGallery from '@/pages/tools/ComponentGallery'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import { Toaster } from '@/components/ui/sonner'

const SharedWireframeView = lazy(() => import('@/pages/SharedWireframeView'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected operator routes (inside Layout) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Documentacao via Markdoc — catch-all para docs/ */}
          <Route path="/processo/*" element={<DocRenderer />} />
          <Route path="/referencias/*" element={<DocRenderer />} />
          <Route path="/padroes/*" element={<DocRenderer />} />
          <Route path="/ferramentas/wireframe-builder/galeria" element={<ComponentGallery />} />
          <Route path="/ferramentas/*" element={<DocRenderer />} />

          {/* Paginas interativas de clientes */}
          <Route path="/clients/financeiro-conta-azul" element={<FinanceiroIndex />} />
          <Route path="/clients/:clientSlug/briefing" element={<BriefingForm />} />
          <Route path="/clients/:clientSlug/blueprint" element={<BlueprintTextView />} />
          <Route path="/clients/financeiro-conta-azul/:doc" element={<FinanceiroDocViewer />} />
        </Route>

        {/* Auth pages — public, full screen */}
        <Route path="/login/*" element={<Login />} />
        <Route
          path="/signup/*"
          element={
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
              <SignUp routing="path" path="/signup" signInUrl="/login" />
            </div>
          }
        />

        {/* Profile — protected, full screen */}
        <Route
          path="/perfil/*"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        {/* Wireframe viewer — protected, full screen, parametric by client slug */}
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
