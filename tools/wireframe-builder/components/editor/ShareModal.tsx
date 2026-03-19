import { useEffect, useState } from 'react'
import { Copy, Link2, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import {
  createShareToken,
  getTokensForClient,
  revokeToken,
} from '@tools/wireframe-builder/lib/tokens'
import type { ShareToken } from '@tools/wireframe-builder/types/comments'

type Props = {
  open: boolean
  onClose: () => void
  clientSlug: string
  userId: string
  orgId: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function truncateToken(token: string): string {
  if (token.length <= 12) return token
  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

export default function ShareModal({ open, onClose, clientSlug, userId, orgId }: Props) {
  const [tokens, setTokens] = useState<ShareToken[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function fetchTokens() {
      setLoading(true)
      try {
        const result = await getTokensForClient(clientSlug)
        if (!cancelled) {
          setTokens(result)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Erro ao carregar tokens'
          toast.error('Erro ao carregar links', { description: message })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTokens()

    return () => {
      cancelled = true
    }
  }, [open, clientSlug])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const newToken = await createShareToken(clientSlug, userId, orgId, 30)
      setTokens((prev) => [newToken, ...prev])
      toast.success('Link gerado!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar link'
      toast.error('Erro ao gerar link', { description: message })
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy(token: ShareToken) {
    const url = `${window.location.origin}/wireframe-view?token=${token.token}&client=${clientSlug}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao copiar'
      toast.error('Erro ao copiar link', { description: message })
    }
  }

  async function handleRevoke(token: ShareToken) {
    try {
      await revokeToken(token.id)
      setTokens((prev) => prev.filter((t) => t.id !== token.id))
      toast.success('Link revogado!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao revogar'
      toast.error('Erro ao revogar link', { description: message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Links de compartilhamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--wf-accent, #1A237E)',
              color: 'var(--wf-accent-fg, #FFFFFF)',
            }}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {generating ? 'Gerando...' : 'Gerar novo link'}
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : tokens.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum link ativo
            </p>
          ) : (
            <ul className="space-y-2">
              {tokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {truncateToken(token.token)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Expira em {formatDate(token.expires_at)}
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(token)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Copiar link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(token)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Revogar link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
