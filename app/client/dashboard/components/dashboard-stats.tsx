import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, CheckCircle, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Applications",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: Briefcase,
  },
  {
    title: "Pending Reviews",
    value: "8",
    change: "+3",
    changeType: "neutral" as const,
    icon: Clock,
  },
  {
    title: "Interviews Scheduled",
    value: "3",
    change: "+2",
    changeType: "positive" as const,
    icon: CheckCircle,
  },
  {
    title: "Response Rate",
    value: "67%",
    change: "+5%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

export function DashboardStats() {
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
