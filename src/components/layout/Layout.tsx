import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f7fafc_0%,#ffffff_28%,#f4f7fb_100%)]">
      <TopNav />
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
