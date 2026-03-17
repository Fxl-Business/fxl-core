import { useUser } from '@clerk/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

export interface AdminModeState {
  isSuperAdmin: boolean
  isAdminRoute: boolean
  toggleMode: () => void
}

export function useAdminMode(): AdminModeState {
  const { user } = useUser()
  const location = useLocation()
  const navigate = useNavigate()

  const isSuperAdmin = user?.publicMetadata?.super_admin === true

  const isAdminRoute = location.pathname.startsWith('/admin')

  const toggleMode = useCallback(() => {
    if (isAdminRoute) {
      navigate('/')
    } else {
      navigate('/admin')
    }
  }, [isAdminRoute, navigate])

  return { isSuperAdmin, isAdminRoute, toggleMode }
}
