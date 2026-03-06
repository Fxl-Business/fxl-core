import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import DocRenderer from '@/pages/DocRenderer'
import FinanceiroIndex from '@/pages/clients/FinanceiroContaAzul/Index'
import FinanceiroDocViewer from '@/pages/clients/FinanceiroContaAzul/DocViewer'
import FinanceiroWireframe from '@/pages/clients/FinanceiroContaAzul/Wireframe'
import FinanceiroWireframeViewer from '@/pages/clients/FinanceiroContaAzul/WireframeViewer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Documentacao via Markdoc — catch-all para docs/ */}
          <Route path="/processo/*" element={<DocRenderer />} />
          <Route path="/build/*" element={<DocRenderer />} />
          <Route path="/referencias/*" element={<DocRenderer />} />
          <Route path="/operacao/*" element={<DocRenderer />} />

          {/* Paginas interativas de clientes */}
          <Route path="/clients/financeiro-conta-azul" element={<FinanceiroIndex />} />
          <Route path="/clients/financeiro-conta-azul/wireframe" element={<FinanceiroWireframe />} />
          <Route path="/clients/financeiro-conta-azul/:doc" element={<FinanceiroDocViewer />} />
        </Route>

        {/* Wireframe viewer — fora do Layout (tela cheia) */}
        <Route
          path="/clients/financeiro-conta-azul/wireframe-view"
          element={<FinanceiroWireframeViewer />}
        />
      </Routes>
    </BrowserRouter>
  )
}
