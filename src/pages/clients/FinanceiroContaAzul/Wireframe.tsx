export default function FinanceiroWireframe() {
  return (
    <div className="relative min-h-screen">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-fxl-navy">
          Financeiro Conta Azul
        </span>
        <h1 className="mt-1 text-2xl font-bold text-fxl-navy">Wireframe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Blueprint aprovado em 2026-03-05 · 10 telas
        </p>
      </div>
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        <p className="mb-6 text-sm text-muted-foreground">
          O wireframe abre em página própria, sem a sidebar de documentação.
        </p>
        <a
          href="/clients/financeiro-conta-azul/wireframe-view"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-fxl-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-fxl-navy-light"
        >
          Visualizar Wireframe →
        </a>
      </div>
    </div>
  )
}
