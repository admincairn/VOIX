// ============================================================
// VOIX — Dashboard Layout (Mobile-first)
// ============================================================

import { redirect }          from 'next/navigation'
import { auth }              from '@/lib/auth'
import { DashboardSidebar }  from '@/components/dashboard/sidebar'
import { DashboardTopbar }   from '@/components/dashboard/topbar'
import { MobileTopbar }      from '@/components/dashboard/mobile-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user)        redirect('/auth/signin')
  if (!session.user.onboarded) redirect('/onboarding')

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <DashboardSidebar user={session.user} />
      </div>

      {/* Mobile drawer + topbar */}
      <MobileTopbar user={session.user} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="hidden lg:flex">
          <DashboardTopbar user={session.user} />
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-thin
                         pt-14 lg:pt-0
                         px-4 py-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
