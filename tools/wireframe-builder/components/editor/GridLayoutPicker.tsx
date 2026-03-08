import { LayoutGrid } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GRID_LAYOUTS } from '../../lib/grid-layouts'
import type { GridLayout } from '../../types/editor'

type Props = {
  current: GridLayout
  onChange: (layout: GridLayout) => void
}

const LAYOUT_OPTIONS: GridLayout[] = ['1', '2', '3', '2-1', '1-2']

function LayoutThumbnail({ layout, active }: { layout: GridLayout; active: boolean }) {
  const base = 'flex gap-0.5 h-5 w-10 items-stretch rounded-sm p-0.5 transition-colors cursor-pointer'
  const ring = active ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted hover:bg-muted/80'
  const barClass = 'rounded-[1px] bg-foreground/40'

  return (
    <div className={`${base} ${ring}`}>
      {layout === '1' && <div className={`${barClass} flex-1`} />}
      {layout === '2' && (
        <>
          <div className={`${barClass} flex-1`} />
          <div className={`${barClass} flex-1`} />
        </>
      )}
      {layout === '3' && (
        <>
          <div className={`${barClass} flex-1`} />
          <div className={`${barClass} flex-1`} />
          <div className={`${barClass} flex-1`} />
        </>
      )}
      {layout === '2-1' && (
        <>
          <div className={`${barClass} flex-[2]`} />
          <div className={`${barClass} flex-1`} />
        </>
      )}
      {layout === '1-2' && (
        <>
          <div className={`${barClass} flex-1`} />
          <div className={`${barClass} flex-[2]`} />
        </>
      )}
    </div>
  )
}

export default function GridLayoutPicker({ current, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Alterar layout"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Layout da Linha</p>
        <div className="flex flex-col gap-1.5">
          {LAYOUT_OPTIONS.map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => onChange(layout)}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent"
            >
              <LayoutThumbnail layout={layout} active={layout === current} />
              <span className="text-muted-foreground">{GRID_LAYOUTS[layout].label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
