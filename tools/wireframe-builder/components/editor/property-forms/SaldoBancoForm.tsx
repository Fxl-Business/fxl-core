import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type {
  SaldoBancoSection,
  BankEntry,
} from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: SaldoBancoSection
  onChange: (updated: SaldoBancoSection) => void
}

const DEFAULT_BANK: BankEntry = {
  label: 'Novo banco',
  value: 'R$ 0,00',
}

export default function SaldoBancoForm({ section, onChange }: Props) {
  function handleAddBank() {
    onChange({ ...section, banks: [...section.banks, { ...DEFAULT_BANK }] })
  }

  function handleRemoveBank(index: number) {
    onChange({
      ...section,
      banks: section.banks.filter((_, i) => i !== index),
    })
  }

  function handleUpdateBank(
    index: number,
    field: keyof BankEntry,
    value: string
  ) {
    onChange({
      ...section,
      banks: section.banks.map((bank, i) =>
        i === index ? { ...bank, [field]: value } : bank
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="saldo-title">Titulo</Label>
        <Input
          id="saldo-title"
          value={section.title ?? ''}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label htmlFor="saldo-note">Nota</Label>
        <Input
          id="saldo-note"
          value={section.note ?? ''}
          onChange={(e) => onChange({ ...section, note: e.target.value })}
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label htmlFor="saldo-total">Total</Label>
        <Input
          id="saldo-total"
          value={section.total}
          onChange={(e) => onChange({ ...section, total: e.target.value })}
        />
      </div>

      <div>
        <Label>Bancos</Label>
        <div className="space-y-2 mt-1">
          {section.banks.map((bank, index) => (
            <div
              key={index}
              className="p-3 rounded-md border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Banco {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveBank(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Label"
                value={bank.label}
                onChange={(e) =>
                  handleUpdateBank(index, 'label', e.target.value)
                }
              />
              <Input
                placeholder="Valor"
                value={bank.value}
                onChange={(e) =>
                  handleUpdateBank(index, 'value', e.target.value)
                }
              />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={handleAddBank}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar Banco
        </Button>
      </div>
    </div>
  )
}
