import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  footer: string
  onChange: (footer: string) => void
}

export default function SidebarFooterForm({ footer, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sidebar-footer-text">Texto do Rodape</Label>
        <Input
          id="sidebar-footer-text"
          value={footer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Desenvolvido por FXL"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Texto exibido no rodape da sidebar
        </p>
      </div>
    </div>
  )
}
