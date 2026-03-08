import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Table2,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  Upload,
  Download,
  Settings,
  Users,
  Building2,
  Calendar,
  Clock,
  Target,
  Activity,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_OPTIONS = [
  'layout-dashboard',
  'bar-chart-3',
  'pie-chart',
  'table-2',
  'trending-up',
  'dollar-sign',
  'credit-card',
  'wallet',
  'receipt',
  'file-text',
  'upload',
  'download',
  'settings',
  'users',
  'building-2',
  'calendar',
  'clock',
  'target',
  'activity',
  'layers',
] as const

const ICON_MAP: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  'table-2': Table2,
  'trending-up': TrendingUp,
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  wallet: Wallet,
  receipt: Receipt,
  'file-text': FileText,
  upload: Upload,
  download: Download,
  settings: Settings,
  users: Users,
  'building-2': Building2,
  calendar: Calendar,
  clock: Clock,
  target: Target,
  activity: Activity,
  layers: Layers,
}

type Props = {
  value: string
  onChange: (icon: string) => void
}

export function getIconComponent(name: string): LucideIcon | undefined {
  return ICON_MAP[name]
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const SelectedIcon = ICON_MAP[value] ?? LayoutDashboard

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <SelectedIcon className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="grid grid-cols-5 gap-1.5">
          {ICON_OPTIONS.map((iconName) => {
            const Icon = ICON_MAP[iconName]
            return (
              <button
                key={iconName}
                type="button"
                className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-md transition-colors hover:bg-accent',
                  value === iconName &&
                    'bg-primary/10 ring-1 ring-primary'
                )}
                onClick={() => {
                  onChange(iconName)
                  setOpen(false)
                }}
                title={iconName}
              >
                <Icon className="h-4.5 w-4.5" />
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
