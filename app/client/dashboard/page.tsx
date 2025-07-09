"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Clock, DollarSign, Search, Filter, Camera, CheckCircle, Users, Briefcase } from "lucide-react"
import { SandFlow } from "@/components/sand-flow"
import Link from "next/link"

// Mock data with connection system
const photographers = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 4.9,
    reviews: 127,
    location: "New York, NY",
    distance: "2.3 miles",
    specialties: ["Wedding", "Portrait", "Event"],
    hourlyRate: 350,
    currency: "USD",
    availability: "Available",
    avatar: "/placeholder.svg?height=60&width=60",
    featured: true,
    verified: true,
    connections: 1240,
    projects: 89,
    posts: 156,
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4.8,
    reviews: 89,
    location: "Brooklyn, NY",
    distance: "5.1 miles",
    specialties: ["Commercial", "Product", "Fashion"],
    hourlyRate: 450,
    currency: "USD",
    availability: "Busy until Dec 15",
    avatar: "/placeholder.svg?height=60&width=60",
    featured: true,
    verified: true,
    connections: 2100,
    projects: 134,
    posts: 203,
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    rating: 4.7,
    reviews: 156,
    location: "Manhattan, NY",
    distance: "3.8 miles",
    specialties: ["Street", "Documentary", "Travel"],
    hourlyRate: 280,
    currency: "USD",
    availability: "Available",
    avatar: "/placeholder.svg?height=60&width=60",
    featured: false,
    verified: true,
    connections: 890,
    projects: 67,
    posts: 124,
  },
  {
    id: 4,
    name: "David Kim",
    rating: 4.9,
    reviews: 203,
    location: "Queens, NY",
    distance: "7.2 miles",
    specialties: ["Wedding", "Family", "Maternity"],
    hourlyRate: 320,
    currency: "USD",
    availability: "Available",
    avatar: "/placeholder.svg?height=60&width=60",
    featured: true,
    verified: true,
    connections: 1560,
    projects: 98,
    posts: 187,
  },
]

export default function ClientDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterBy, setFilterBy] = useState("all")

  const filteredPhotographers = photographers
    .filter((photographer) => {
      const matchesSearch =
        photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photographer.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "available" && photographer.availability === "Available") ||
        (filterBy === "featured" && photographer.featured)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "distance":
          return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
        case "price":
          return a.hourlyRate - b.hourlyRate
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen relative">
      <SandFlow />
      <div className="relative z-10">
        {/* Refined Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/50 dark:bg-slate-800/95 amoled:bg-black/95 dark:border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <Camera className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  <div className="verification-dot absolute -top-1 -right-1"></div>
                </div>
                <span className="text-xl font-light tracking-wide bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent dark:from-white dark:via-slate-300 dark:to-white">
                  ClickHire
                </span>
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 font-light"
                >
                  Client
                </Badge>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/client/post-job">
                  <Button className="refined-button-secondary font-light">Post a Job</Button>
                </Link>
                <div className="relative">
                  <Avatar className="ring-1 ring-slate-300 dark:ring-slate-600">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="verification-dot absolute -top-1 -right-1"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Refined Search Section */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-8">
              <h1 className="text-4xl font-light text-slate-800 dark:text-white">Photographers</h1>
              <div className="verification-dot"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search photographers or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 font-light"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-slate-300 focus:border-slate-400 font-light">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                  <SelectItem value="price">Rate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48 border-slate-300 focus:border-slate-400 font-light">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Photographers</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Photographers */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-8">
              <h2 className="text-2xl font-light text-slate-800 dark:text-white">Featured</h2>
              <div className="verification-dot"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotographers
                .filter((p) => p.featured)
                .map((photographer) => (
                  <Card key={photographer.id} className="refined-card border-slate-200/50 dark:border-slate-700/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-1 ring-slate-300 dark:ring-slate-600">
                            <AvatarImage src={photographer.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300">
                              {photographer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {photographer.verified && <div className="verification-dot absolute -top-1 -right-1"></div>}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-light text-slate-800 dark:text-white">
                            {photographer.name}
                          </CardTitle>
                          <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-light">{photographer.rating}</span>
                            <span className="font-light">({photographer.reviews})</span>
                          </div>
                        </div>
                        {photographer.verified && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-light">
                          {photographer.location} • {photographer.distance}
                        </span>
                      </div>

                      {/* Professional Stats */}
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{photographer.connections.toLocaleString()} connections</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{photographer.projects} projects</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Camera className="h-3 w-3" />
                          <span>{photographer.posts} posts</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {photographer.specialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="secondary"
                            className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-light"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-slate-500" />
                          <span className="font-light text-slate-800 dark:text-white">
                            ${photographer.hourlyRate}/hr
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1 text-slate-500" />
                          <span
                            className={
                              photographer.availability === "Available"
                                ? "text-emerald-600 font-light"
                                : "text-amber-600 font-light"
                            }
                          >
                            {photographer.availability}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Link href={`/client/photographer/${photographer.id}`} className="flex-1">
                          <Button className="refined-button w-full text-white font-light" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/messages?contact=${photographer.id}`}>
                          <Button className="refined-button-secondary font-light" size="sm">
                            Message
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* All Photographers */}
          <div>
            <h2 className="text-2xl font-light text-slate-800 dark:text-white mb-8">All Photographers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotographers
                .filter((p) => !p.featured)
                .map((photographer) => (
                  <Card key={photographer.id} className="refined-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-1 ring-slate-300 dark:ring-slate-600">
                            <AvatarImage src={photographer.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300">
                              {photographer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {photographer.verified && <div className="verification-dot absolute -top-1 -right-1"></div>}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-light text-slate-800 dark:text-white">
                            {photographer.name}
                          </CardTitle>
                          <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-light">{photographer.rating}</span>
                            <span className="font-light">({photographer.reviews})</span>
                          </div>
                        </div>
                        {photographer.verified && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-light">
                          {photographer.location} • {photographer.distance}
                        </span>
                      </div>

                      {/* Professional Stats */}
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{photographer.connections.toLocaleString()} connections</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{photographer.projects} projects</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Camera className="h-3 w-3" />
                          <span>{photographer.posts} posts</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {photographer.specialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="secondary"
                            className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-light"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-slate-500" />
                          <span className="font-light text-slate-800 dark:text-white">
                            ${photographer.hourlyRate}/hr
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1 text-slate-500" />
                          <span
                            className={
                              photographer.availability === "Available"
                                ? "text-emerald-600 font-light"
                                : "text-amber-600 font-light"
                            }
                          >
                            {photographer.availability}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Link href={`/client/photographer/${photographer.id}`} className="flex-1">
                          <Button className="refined-button-secondary w-full font-light" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/messages?contact=${photographer.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 font-light bg-transparent"
                          >
                            Message
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
