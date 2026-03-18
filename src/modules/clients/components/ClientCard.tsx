import { Link } from 'react-router-dom'
import { ChevronRight, Building2 } from 'lucide-react'
import { Card, CardContent } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import type { Client, ClientStatus } from '../types'

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
}

const STATUS_VARIANTS: Record<ClientStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-400/30',
  inactive: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-400/30',
  archived: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-400/30',
}

// ---------------------------------------------------------------------------
// ClientCard
// ---------------------------------------------------------------------------

interface ClientCardProps {
  client: Client
}

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <Link to={`/clientes/${client.slug}`}>
      <Card className="group cursor-pointer border-slate-200 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:hover:border-indigo-600/50 dark:hover:bg-indigo-950/20">
        <CardContent className="flex items-center gap-4 p-5">
          {/* Logo / avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            {client.logo_url ? (
              <img
                src={client.logo_url}
                alt={client.name}
                className="h-8 w-8 rounded object-contain"
              />
            ) : (
              <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-foreground dark:group-hover:text-indigo-400">
                {client.name}
              </p>
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] ${STATUS_VARIANTS[client.status]}`}
              >
                {STATUS_LABELS[client.status]}
              </Badge>
            </div>
            {client.description && (
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {client.description}
              </p>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
        </CardContent>
      </Card>
    </Link>
  )
}
