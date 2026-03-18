import { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useUser, useClerk } from '@clerk/react'

/**
 * User avatar + logout dropdown for TopNav.
 *
 * - Shows user avatar (imageUrl) or initials fallback
 * - Dropdown: name, email, divider, logout
 * - signOut redirects to /login
 */
export function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click — identical pattern to OrgPicker
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

  if (!user) return null

  // Build display name and initials
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuário'
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  const initials = (() => {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return fullName.slice(0, 2).toUpperCase()
  })()

  function handleSignOut() {
    void signOut({ redirectUrl: '/login' })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-slate-200 dark:hover:ring-slate-700"
        title={fullName}
        aria-label="Menu do usuário"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-border dark:bg-popover">
          {/* User info header — not clickable */}
          <div className="px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-foreground">
              {fullName}
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-muted-foreground">
              {email}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-border" />

          {/* Logout */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50 dark:text-foreground dark:hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400 dark:text-muted-foreground" />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
