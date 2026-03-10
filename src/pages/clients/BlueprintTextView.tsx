import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { loadBlueprint } from '@tools/wireframe-builder/lib/blueprint-store'
import { extractBlueprintSummary } from '@tools/wireframe-builder/lib/blueprint-text'
import { exportBlueprintMarkdown, downloadMarkdown } from '@tools/wireframe-builder/lib/blueprint-export'
import type { BlueprintConfig } from '@tools/wireframe-builder/types/blueprint'
import type { BlueprintSummary, ScreenSummary, SectionSummary } from '@tools/wireframe-builder/lib/blueprint-text'

// ---------------------------------------------------------------------------
// Wrapper component -- extracts clientSlug safely before hooks
// ---------------------------------------------------------------------------

export default function BlueprintTextView() {
  const { clientSlug } = useParams<{ clientSlug: string }>()

  if (!clientSlug) {
    return <Navigate to="/" replace />
  }

  return <BlueprintTextViewInner clientSlug={clientSlug} />
}

// ---------------------------------------------------------------------------
// Inner component -- guaranteed clientSlug, safe hook usage
// ---------------------------------------------------------------------------

function BlueprintTextViewInner({ clientSlug }: { clientSlug: string }) {
  const [config, setConfig] = useState<BlueprintConfig | null>(null)
  const [summary, setSummary] = useState<BlueprintSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedScreens, setExpandedScreens] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function init() {
      try {
        const result = await loadBlueprint(clientSlug)
        if (!result) {
          setError('Nenhum blueprint encontrado para este cliente.')
          return
        }
        setConfig(result.config)
        const extracted = extractBlueprintSummary(result.config)
        setSummary(extracted)
        // Default: all screens expanded
        setExpandedScreens(new Set(extracted.screens.map((s) => s.id)))
      } catch (err) {
        console.error('Failed to load blueprint:', err)
        const message = err instanceof Error ? err.message : 'Erro ao carregar blueprint.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [clientSlug])

  function handleToggleScreen(screenId: string) {
    setExpandedScreens((prev) => {
      const next = new Set(prev)
      if (next.has(screenId)) {
        next.delete(screenId)
      } else {
        next.add(screenId)
      }
      return next
    })
  }

  function handleExport() {
    if (!config) return
    const markdown = exportBlueprintMarkdown(config)
    downloadMarkdown(markdown, `${clientSlug}-blueprint.md`)
    toast.success('Blueprint exportado!')
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Carregando blueprint...</p>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  // --- Empty state ---
  if (!summary || !config) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Nenhum blueprint encontrado.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {summary.clientName} - Blueprint
        </h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Markdown
        </Button>
      </div>

      {/* Screens */}
      <div className="space-y-4">
        {summary.screens.map((screen) => (
          <ScreenCard
            key={screen.id}
            screen={screen}
            expanded={expandedScreens.has(screen.id)}
            onToggle={() => handleToggleScreen(screen.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen card (collapsible)
// ---------------------------------------------------------------------------

function ScreenCard({
  screen,
  expanded,
  onToggle,
}: {
  screen: ScreenSummary
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <Card>
      <CardHeader className="cursor-pointer pb-3" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{screen.title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {screen.sections.length} {screen.sections.length === 1 ? 'secao' : 'secoes'}
            </Badge>
          </div>
        </div>
        {/* Filters and period type */}
        {(screen.filters || screen.periodType) && (
          <div className="ml-7 flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
            {screen.filters && screen.filters.length > 0 && (
              <span>Filtros: {screen.filters.join(', ')}</span>
            )}
            {screen.periodType && (
              <span>Periodo: {screen.periodType}</span>
            )}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {screen.sections.map((section, index) => (
              <SectionRow key={`${section.type}-${index}`} section={section} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section row
// ---------------------------------------------------------------------------

function SectionRow({ section }: { section: SectionSummary }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/50 bg-muted/30 px-4 py-2.5">
      <Badge variant="outline" className="mt-0.5 shrink-0 text-[11px]">
        {section.label}
      </Badge>
      <div className="min-w-0 flex-1">
        {section.title && (
          <p className="text-sm font-medium text-foreground">{section.title}</p>
        )}
        {section.keyFields.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {section.keyFields.join(', ')}
          </p>
        )}
        {!section.title && section.keyFields.length === 0 && (
          <p className="text-xs italic text-muted-foreground">-</p>
        )}
      </div>
    </div>
  )
}
