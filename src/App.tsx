import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import DocRenderer from '@/pages/DocRenderer'
import FinanceiroIndex from '@/pages/clients/FinanceiroContaAzul/Index'
import FinanceiroDocViewer from '@/pages/clients/FinanceiroContaAzul/DocViewer'
import FinanceiroWireframe from '@/pages/clients/FinanceiroContaAzul/Wireframe'
import FinanceiroWireframeViewer from '@/pages/clients/FinanceiroContaAzul/WireframeViewer'
import ComponentGallery from '@/pages/tools/ComponentGallery'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'

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
          <Route path="/clients/financeiro-conta-azul/wireframe" element={<FinanceiroWireframe />} />
          <Route path="/clients/financeiro-conta-azul/:doc" element={<FinanceiroDocViewer />} />
        </Route>

        {/* Auth pages — public, full screen */}
        <Route path="/login/*" element={<Login />} />
        <Route
          path="/signup/*"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
              <SignUp routing="path" path="/signup" signInUrl="/login" />
            </div>
          }
        />

        {/* Profile — protected, full screen */}
        <Route
          path="/perfil/*"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        {/* Wireframe viewer — protected, full screen */}
        <Route
          path="/clients/financeiro-conta-azul/wireframe-view"
          element={<ProtectedRoute><FinanceiroWireframeViewer /></ProtectedRoute>}
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
    </BrowserRouter>
  )
}
