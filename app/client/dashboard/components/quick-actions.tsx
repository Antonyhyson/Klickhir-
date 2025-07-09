"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, FileText, Calendar } from "lucide-react"

const actions = [
  {
    title: "Apply to New Job",
    description: "Find and apply to new opportunities",
    icon: Plus,
    action: () => console.log("Navigate to job search"),
  },
  {
    title: "Search Jobs",
    description: "Browse available positions",
    icon: Search,
    action: () => console.log("Navigate to job search"),
  },
  {
    title: "Update Resume",
    description: "Keep your profile current",
    icon: FileText,
    action: () => console.log("Navigate to profile"),
  },
  {
    title: "Schedule Interview",
    description: "Manage your interview calendar",
    icon: Calendar,
    action: () => console.log("Navigate to calendar"),
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={action.action}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{action.title}</span>
                </div>
                <p className="text-sm text-gray-600 text-left">{action.description}</p>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
