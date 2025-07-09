"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Camera, Clock, DollarSign, Users, Briefcase, TrendingUp } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import Link from "next/link"

// Mock data for nearby jobs
const nearbyJobs = [
  {
    id: 1,
    title: "Wedding Photography - Central Park",
    client: "Jennifer & Mark",
    location: "Central Park, NY",
    distance: "1.2 miles",
    date: "Dec 20, 2024",
    duration: "8 hours",
    budget: 2500,
    currency: "USD",
    type: "Wedding",
    urgent: false,
    description: "Looking for an experienced wedding photographer for our outdoor ceremony in Central Park.",
    client_id: "client-1",
  },
  {
    id: 2,
    title: "Corporate Headshots",
    client: "TechCorp Inc.",
    location: "Manhattan, NY",
    distance: "3.5 miles",
    date: "Dec 18, 2024",
    duration: "4 hours",
    budget: 800,
    currency: "USD",
    type: "Corporate",
    urgent: true,
    description: "Need professional headshots for 15 employees. Studio setup preferred.",
    client_id: "client-2",
  },
  {
    id: 3,
    title: "Product Photography Session",
    client: "Fashion Boutique",
    location: "SoHo, NY",
    distance: "4.1 miles",
    date: "Dec 22, 2024",
    duration: "6 hours",
    budget: 1200,
    currency: "USD",
    type: "Product",
    urgent: false,
    description: "Fashion product shoot for new winter collection. Experience with clothing photography required.",
    client_id: "client-3",
  },
]

// Mock data for collaboration opportunities
const collaborationJobs = [
  {
    id: 1,
    title: "Fashion Week Coverage",
    client: "Vogue Magazine",
    location: "Multiple venues, NY",
    date: "Feb 10-17, 2025",
    budget: 15000,
    currency: "USD",
    photographers: 5,
    currentApplicants: 12,
    type: "Fashion",
    featured: true,
    description: "Large-scale fashion week coverage requiring multiple photographers for different venues and events.",
  },
  {
    id: 2,
    title: "Music Festival Documentation",
    client: "Summer Sounds Festival",
    location: "Brooklyn, NY",
    date: "Jun 15-17, 2025",
    budget: 8000,
    currency: "USD",
    photographers: 3,
    currentApplicants: 8,
    type: "Event",
    featured: true,
    description: "Multi-day music festival requiring team of photographers for stage, crowd, and backstage coverage.",
  },
  {
    id: 3,
    title: "Real Estate Portfolio",
    client: "Luxury Properties NYC",
    location: "Various locations, NY",
    date: "Ongoing",
    budget: 5000,
    currency: "USD",
    photographers: 2,
    currentApplicants: 6,
    type: "Real Estate",
    featured: false,
    description: "Ongoing project photographing luxury properties across NYC. Team approach for efficiency.",
  },
]

export default function PhotographerDashboard() {
  const [activeTab, setActiveTab] = useState("nearby")

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-green-600" />
                <span className="text-xl font-bold">ClickHire</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Photographer
                </Badge>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/photographer/post-work">
                  <Button variant="outline">Share Work</Button>
                </Link>
                <Link href="/photographer/portfolio">
                  <Button variant="outline">My Portfolio</Button>
                </Link>
                <Button variant="outline">Settings</Button>
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">$8.5K</p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nearby">Nearby Work</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="nearby" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Jobs Near You</h2>
                  <Button variant="outline">Filter Jobs</Button>
                </div>

                <div className="grid gap-6">
                  {nearbyJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-xl">{job.title}</CardTitle>
                              {job.urgent && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {job.type}
                              </Badge>
                            </div>
                            <CardDescription>by {job.client}</CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${job.budget.toLocaleString()} {job.currency}
                            </p>
                            <p className="text-sm text-gray-600">{job.duration}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700">{job.description}</p>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {job.location} • {job.distance}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{job.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <Button className="flex-1">Apply Now</Button>
                          <Button variant="outline">Save Job</Button>
                          <Link href={`/messages?contact=${job.client_id || "client-1"}`}>
                            <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                              Message Client
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Collaboration Opportunities</h2>
                  <Button variant="outline">View All</Button>
                </div>

                <div className="grid gap-6">
                  {collaborationJobs.map((job) => (
                    <Card
                      key={job.id}
                      className={`hover:shadow-lg transition-shadow ${job.featured ? "border-2 border-yellow-200" : ""}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-xl">{job.title}</CardTitle>
                              {job.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {job.type}
                              </Badge>
                            </div>
                            <CardDescription>by {job.client}</CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${job.budget.toLocaleString()} {job.currency}
                            </p>
                            <p className="text-sm text-gray-600">Total Budget</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700">{job.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{job.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-blue-600" />
                              <span>{job.photographers} photographers needed</span>
                            </div>
                            <div className="text-gray-600">{job.currentApplicants} applicants</div>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <Button className="flex-1">Join Collaboration</Button>
                          <Button variant="outline">View Details</Button>
                          <Button variant="outline">Contact Team</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
