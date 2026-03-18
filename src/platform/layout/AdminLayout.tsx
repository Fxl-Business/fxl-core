import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import TopNav from './TopNav'
import ScrollToTop from './ScrollToTop'
import { ImpersonationBanner } from './ImpersonationBanner'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <ImpersonationBanner />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-8 py-10 lg:px-12">
          <Outlet />
        </main>
      </div>
      <ScrollToTop />
    </div>
  )
}
