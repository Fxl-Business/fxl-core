import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Textarea } from '@shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { toast } from 'sonner'
import { createTask, updateTask, getTask } from '../services/tasks-service'
import type { TaskStatus, TaskPriority } from '../services/tasks-service'
import { STATUS_LABELS, PRIORITY_LABELS } from '../types'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'

// ---------------------------------------------------------------------------
// TaskForm — /tarefas/new and /tarefas/:id/edit
// ---------------------------------------------------------------------------

interface FormState {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  clientSlug: string
}

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  clientSlug: '',
}

export default function TaskForm() {
  // ALL hooks must be at the top before any conditional returns (project memory rule)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const { activeOrg } = useActiveOrg()

  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // In edit mode, fetch existing task and pre-fill the form
  useEffect(() => {
    if (!id) return

    setLoading(true)
    getTask(id)
      .then((task) => {
        setFormData({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date ?? '',
          clientSlug: task.client_slug ?? '',
        })
      })
      .catch(() => {
        toast.error('Erro ao carregar tarefa')
        navigate('/tarefas')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, navigate])

  function handleFieldChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditMode && id) {
        await updateTask(id, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          client_slug: formData.clientSlug.trim() !== '' ? formData.clientSlug.trim() : undefined,
        })
        toast.success('Tarefa atualizada')
      } else {
        await createTask({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          client_slug: formData.clientSlug.trim() !== '' ? formData.clientSlug.trim() : undefined,
          org_id: activeOrg?.id ?? '',
        })
        toast.success('Tarefa criada')
      }
      navigate('/tarefas')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(`Erro ao salvar tarefa: ${message}`)
      setSaving(false)
    }
  }

  // Loading state in edit mode
  if (isEditMode && loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/tarefas"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Link>
      </div>

      {/* Page title */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground mb-8">
        {isEditMode ? 'Editar Tarefa' : 'Nova Tarefa'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titulo */}
        <div className="space-y-1.5">
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Titulo <span className="text-red-500">*</span>
          </label>
          <Input
            id="task-title"
            required
            placeholder="Titulo da tarefa"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
          />
        </div>

        {/* Descricao */}
        <div className="space-y-1.5">
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Descricao
          </label>
          <Textarea
            id="task-description"
            placeholder="Descricao"
            rows={4}
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
          />
        </div>

        {/* Status + Prioridade (2-column grid) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-status"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(v) => handleFieldChange('status', v as TaskStatus)}
            >
              <SelectTrigger id="task-status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prioridade */}
          <div className="space-y-1.5">
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Prioridade
            </label>
            <Select
              value={formData.priority}
              onValueChange={(v) => handleFieldChange('priority', v as TaskPriority)}
            >
              <SelectTrigger id="task-priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data de vencimento */}
        <div className="space-y-1.5">
          <label
            htmlFor="task-due-date"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Data de vencimento
          </label>
          <input
            id="task-due-date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleFieldChange('dueDate', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
        </div>

        {/* Slug do cliente */}
        <div className="space-y-1.5">
          <label
            htmlFor="task-client-slug"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Cliente
          </label>
          <Input
            id="task-client-slug"
            placeholder="Slug do cliente (ex: financeiro-conta-azul)"
            value={formData.clientSlug}
            onChange={(e) => handleFieldChange('clientSlug', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving || !formData.title.trim()}>
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Salvando...' : isEditMode ? 'Salvar Alteracoes' : 'Criar Tarefa'}
          </Button>
          <Button variant="outline" type="button" asChild>
            <Link to="/tarefas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
