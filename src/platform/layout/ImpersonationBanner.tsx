import { Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useImpersonation } from '@platform/auth/ImpersonationContext'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedOrgName, exitImpersonation } = useImpersonation()
  const navigate = useNavigate()

  if (!isImpersonating) return null

  function handleExit() {
    exitImpersonation()
    navigate('/admin/tenants')
  }

  return (
    <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-6 py-2 dark:border-amber-800 dark:bg-amber-950/20">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
        <Eye className="h-4 w-4 shrink-0" />
        <span>
          Visualizando como:{' '}
          <span className="font-bold">{impersonatedOrgName ?? 'Organização'}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={handleExit}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/40"
      >
        <X className="h-3.5 w-3.5" />
        Sair da impersonação
      </button>
    </div>
  )
}
