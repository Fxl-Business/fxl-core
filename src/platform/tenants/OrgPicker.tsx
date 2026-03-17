import { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { useActiveOrg } from './useActiveOrg'

/**
 * Organization picker for TopNav.
 *
 * - In anon mode: renders nothing
 * - With 1 org: shows a badge with org name
 * - With 2+ orgs: shows a dropdown to switch between orgs
 */
export function OrgPicker() {
  const { activeOrg, orgs, switchOrg, isLoading } = useActiveOrg()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  // No orgs or still loading, render nothing
  if (isLoading || orgs.length === 0) {
    return null
  }

  const hasMultipleOrgs = orgs.length > 1

  // Single org — show badge only
  if (!hasMultipleOrgs) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-border dark:bg-muted dark:text-muted-foreground">
        <Building2 className="h-3 w-3" />
        <span className="max-w-[120px] truncate">{activeOrg?.name ?? orgs[0].name}</span>
      </div>
    )
  }

  // Multiple orgs — dropdown
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted"
      >
        <Building2 className="h-3 w-3" />
        <span className="max-w-[120px] truncate">{activeOrg?.name ?? 'Select org'}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-border dark:bg-popover">
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => {
                switchOrg(org.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50 dark:text-foreground dark:hover:bg-muted"
            >
              {org.imageUrl ? (
                <img src={org.imageUrl} alt="" className="h-4 w-4 rounded-sm" />
              ) : (
                <Building2 className="h-4 w-4 text-slate-400" />
              )}
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === activeOrg?.id && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
