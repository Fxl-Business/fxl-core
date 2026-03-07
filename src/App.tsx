import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import DocRenderer from '@/pages/DocRenderer'
import FinanceiroIndex from '@/pages/clients/FinanceiroContaAzul/Index'
import FinanceiroDocViewer from '@/pages/clients/FinanceiroContaAzul/DocViewer'
import FinanceiroWireframe from '@/pages/clients/FinanceiroContaAzul/Wireframe'
import FinanceiroWireframeViewer from '@/pages/clients/FinanceiroContaAzul/WireframeViewer'
import ComponentGallery from '@/pages/tools/ComponentGallery'
import Login from '@/pages/Login'

const SharedWireframeView = lazy(() => import('@/pages/SharedWireframeView'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Documentacao via Markdoc — catch-all para docs/ */}
          <Route path="/processo/*" element={<DocRenderer />} />
          <Route path="/referencias/*" element={<DocRenderer />} />
          <Route path="/ferramentas/wireframe-builder/galeria" element={<ComponentGallery />} />
          <Route path="/ferramentas/*" element={<DocRenderer />} />

          {/* Paginas interativas de clientes */}
          <Route path="/clients/financeiro-conta-azul" element={<FinanceiroIndex />} />
          <Route path="/clients/financeiro-conta-azul/wireframe" element={<FinanceiroWireframe />} />
          <Route path="/clients/financeiro-conta-azul/:doc" element={<FinanceiroDocViewer />} />
        </Route>

        {/* Login — fora do Layout (tela cheia, sem sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* Wireframe viewer — fora do Layout (tela cheia) */}
        <Route
          path="/clients/financeiro-conta-azul/wireframe-view"
          element={<FinanceiroWireframeViewer />}
        />

        {/* Shared wireframe viewer for external clients (token-gated) */}
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
