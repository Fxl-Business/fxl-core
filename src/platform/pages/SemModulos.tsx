import { Layers } from 'lucide-react'

export default function SemModulos() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
        <Layers className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-2">
        Nenhum módulo habilitado
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        Sua empresa ainda não tem módulos configurados. Entre em contato com o administrador do Nexo para habilitar módulos para a sua conta.
      </p>
    </div>
  )
}
