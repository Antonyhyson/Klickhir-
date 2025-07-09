import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const applications = [
  {
    id: 1,
    company: "TechCorp Inc.",
    position: "Senior Frontend Developer",
    status: "Interview Scheduled",
    appliedDate: "2024-01-15",
    statusColor: "bg-blue-100 text-blue-800",
  },
  {
    id: 2,
    company: "StartupXYZ",
    position: "Full Stack Engineer",
    status: "Under Review",
    appliedDate: "2024-01-12",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: 3,
    company: "BigTech Solutions",
    position: "React Developer",
    status: "Applied",
    appliedDate: "2024-01-10",
    statusColor: "bg-gray-100 text-gray-800",
  },
  {
    id: 4,
    company: "InnovateLab",
    position: "UI/UX Developer",
    status: "Rejected",
    appliedDate: "2024-01-08",
    statusColor: "bg-red-100 text-red-800",
  },
]

export function RecentApplications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{app.position}</h3>
                <p className="text-sm text-gray-600">{app.company}</p>
                <p className="text-xs text-gray-500">Applied on {app.appliedDate}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={app.statusColor}>{app.status}</Badge>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            View All Applications
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
