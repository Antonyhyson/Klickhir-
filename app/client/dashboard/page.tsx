import { Suspense } from "react"
import { DashboardHeader } from "./components/dashboard-header"
import { DashboardStats } from "./components/dashboard-stats"
import { RecentApplications } from "./components/recent-applications"
import { QuickActions } from "./components/quick-actions"

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Suspense fallback={<div>Loading stats...</div>}>
            <DashboardStats />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<div>Loading applications...</div>}>
              <RecentApplications />
            </Suspense>
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}
