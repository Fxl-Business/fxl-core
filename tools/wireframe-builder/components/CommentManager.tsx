import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, X, Link2, Copy, Check, Trash2, Plus, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/react'
import { getCommentsForClient, resolveComment } from '../lib/comments'
import { createShareToken, getTokensForClient, revokeToken } from '../lib/tokens'
import { parseTargetId } from '../types/comments'
import type { Comment, ShareToken } from '../types/comments'

type Props = {
  clientSlug: string
  open: boolean
  onClose: () => void
}

type FilterType = 'todos' | 'abertos' | 'resolvidos'

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return iso
  }
}

function formatExpiry(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatScreenId(screenId: string): string {
  return screenId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function CommentManager({ clientSlug, open, onClose }: Props) {
  const { user } = useUser()
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [filter, setFilter] = useState<FilterType>('todos')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  const [tokens, setTokens] = useState<ShareToken[]>([])
  const [tokensLoading, setTokensLoading] = useState(false)
  const [creatingToken, setCreatingToken] = useState(false)
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCommentsForClient(clientSlug)
      setAllComments(data)
    } catch {
      // Silently fail -- comments stay empty
    } finally {
      setLoading(false)
    }
  }, [clientSlug])

  const fetchTokens = useCallback(async () => {
    setTokensLoading(true)
    try {
      const data = await getTokensForClient(clientSlug)
      setTokens(data)
    } catch {
      // Silently fail
    } finally {
      setTokensLoading(false)
    }
  }, [clientSlug])

  useEffect(() => {
    if (open) {
      fetchAll()
      fetchTokens()
    }
  }, [open, fetchAll, fetchTokens])

  async function handleResolve(commentId: string) {
    try {
      await resolveComment(commentId)
      await fetchAll()
    } catch {
      // Silently fail on resolve
    }
  }

  async function handleCreateToken() {
    if (!user?.id || creatingToken) return
    setCreatingToken(true)
    try {
      await createShareToken(clientSlug, user.id)
      await fetchTokens()
    } catch {
      // Silently fail
    } finally {
      setCreatingToken(false)
    }
  }

  async function handleRevokeToken(tokenId: string) {
    try {
      await revokeToken(tokenId)
      await fetchTokens()
    } catch {
      // Silently fail
    }
  }

  function handleCopyLink(token: ShareToken) {
    const url = `${window.location.origin}/wireframe-view?token=${token.token}`
    navigator.clipboard.writeText(url)
    setCopiedTokenId(token.id)
    setTimeout(() => setCopiedTokenId(null), 2000)
  }

  function toggleCollapse(screenId: string) {
    setCollapsed((prev) => ({ ...prev, [screenId]: !prev[screenId] }))
  }

  if (!open) return null

  // Filter comments
  const filtered = allComments.filter((c) => {
    if (filter === 'abertos') return !c.resolved
    if (filter === 'resolvidos') return c.resolved
    return true
  })

  // Count for filter labels
  const openCount = allComments.filter((c) => !c.resolved).length
  const resolvedCount = allComments.filter((c) => c.resolved).length

  // Group by screen
  const grouped = new Map<string, Comment[]>()
  for (const comment of filtered) {
    const parsed = parseTargetId(comment.target_id)
    const screenId = parsed.screenId
    const existing = grouped.get(screenId) ?? []
    existing.push(comment)
    grouped.set(screenId, existing)
  }

  const filterButtons: { key: FilterType; label: string; count?: number }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'abertos', label: 'Abertos', count: openCount },
    { key: 'resolvidos', label: 'Resolvidos', count: resolvedCount },
  ]

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-700">Gerenciar Comentarios</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-1 border-b border-gray-100 px-4 py-2">
        {filterButtons.map((fb) => (
          <button
            key={fb.key}
            type="button"
            onClick={() => setFilter(fb.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === fb.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {fb.label}
            {fb.count !== undefined ? ` (${fb.count})` : ''}
          </button>
        ))}
      </div>

      {/* Share token management (only for authenticated operators) */}
      {user && (
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Links de Acesso</h3>
            </div>
            <button
              type="button"
              onClick={handleCreateToken}
              disabled={creatingToken}
              className="flex items-center gap-1.5 rounded-md bg-fxl-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-fxl-navy-light disabled:opacity-50"
            >
              {creatingToken ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Gerar link
            </button>
          </div>

          {tokensLoading && tokens.length === 0 ? (
            <p className="text-sm text-gray-400">Carregando...</p>
          ) : tokens.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum link ativo.</p>
          ) : (
            <div className="space-y-2">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-gray-500">
                      /wireframe-view?token={token.token.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      Expira em {formatExpiry(token.expires_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(token)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-gray-200"
                    aria-label="Copiar link"
                  >
                    {copiedTokenId === token.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevokeToken(token.id)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                    aria-label="Revogar link"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto">
        {loading && allComments.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Carregando comentarios...</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Nenhum comentario encontrado.</p>
        ) : (
          Array.from(grouped.entries()).map(([screenId, screenComments]) => {
            const isCollapsed = collapsed[screenId] === true
            return (
              <div key={screenId}>
                {/* Screen group header */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(screenId)}
                  className="flex w-full items-center gap-2 border-b border-gray-50 bg-gray-50 px-4 py-2.5 text-left hover:bg-gray-100"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {formatScreenId(screenId)}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {screenComments.length}
                  </span>
                </button>

                {/* Comment cards */}
                {!isCollapsed && (
                  <div className="space-y-3 px-4 py-3">
                    {screenComments.map((comment) => {
                      const parsed = parseTargetId(comment.target_id)
                      const isSection = parsed.type === 'section'
                      return (
                        <div
                          key={comment.id}
                          className={`rounded-lg border p-4 ${
                            comment.resolved
                              ? 'border-gray-100 bg-gray-50 opacity-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-sm font-medium text-gray-700">
                                {comment.author_name}
                              </span>
                              <span
                                className={`inline-flex flex-shrink-0 items-center rounded px-2 py-0.5 text-xs font-semibold ${
                                  comment.author_role === 'operador'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {comment.author_role === 'operador' ? 'Operador' : 'Cliente'}
                              </span>
                            </div>
                            <span className="flex-shrink-0 text-xs text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>

                          {isSection && (
                            <p className="mt-1 text-xs text-gray-400">
                              Secao {parsed.type === 'section' ? parsed.sectionIndex + 1 : ''}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                            {comment.text}
                          </p>

                          {comment.resolved ? (
                            <span className="mt-2 inline-block text-xs font-medium text-green-600">
                              Resolvido
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResolve(comment.id)}
                              className="mt-2 rounded-md px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 hover:text-green-700"
                            >
                              Resolver
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
