// ============================================================
// VOIX — Dashboard Layout
// Authenticated area — redirects to /auth/signin if not logged in
// ============================================================

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Redirect to onboarding if not completed
  if (!session.user.onboarded) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]">
      {/* Sidebar */}
      <DashboardSidebar user={session.user} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar user={session.user} />

        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}
