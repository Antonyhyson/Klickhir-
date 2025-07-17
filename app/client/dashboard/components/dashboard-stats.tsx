// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/client/dashboard/components/dashboard-stats.tsx
"use client" // Added "use client" directive

import { useState, useEffect } from "react" // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, CheckCircle, TrendingUp, Loader2 } from "lucide-react" // Added Loader2 for loading indicator

// Remove mock stats data
// const stats = [...]

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any; // Lucide icon component
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/client/dashboard-stats")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Map fetched data to the Stat interface
        const mappedStats: Stat[] = [
          {
            title: "Total Applications",
            value: data.totalApplications.value.toLocaleString(),
            change: data.totalApplications.change,
            changeType: data.totalApplications.changeType,
            icon: Briefcase,
          },
          {
            title: "Pending Reviews",
            value: data.pendingReviews.value.toLocaleString(),
            change: data.pendingReviews.change,
            changeType: data.pendingReviews.changeType,
            icon: Clock,
          },
          {
            title: "Interviews Scheduled",
            value: data.interviewsScheduled.value.toLocaleString(),
            change: data.interviewsScheduled.change,
            changeType: data.interviewsScheduled.changeType,
            icon: CheckCircle,
          },
          {
            title: "Response Rate",
            value: `${data.responseRate.value}%`,
            change: data.responseRate.change,
            changeType: data.responseRate.changeType,
            icon: TrendingUp,
          },
        ]
        setStats(mappedStats)
      } catch (e: any) {
        console.error("Failed to fetch dashboard stats:", e)
        setError("Failed to load dashboard statistics. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, []) // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Loading...</CardTitle>
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-gray-600">Fetching data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full border-red-500">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Error Loading Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}