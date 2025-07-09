"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Star, MapPin, Share, Phone, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"

// Mock photographer work posts with Instagram-style data
const workPosts = [
  {
    id: 1,
    projectName: "Sarah & Mike's Wedding",
    description:
      "Beautiful outdoor ceremony at Central Park with golden hour portraits. The love between these two was absolutely magical to capture! ✨ #WeddingPhotography #CentralPark #GoldenHour",
    location: "Central Park, NY",
    date: "2024-11-15",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    comments: 18,
    shares: 12,
    tags: ["#wedding", "#love", "#centralpark", "#goldenhour"],
  },
  {
    id: 2,
    projectName: "Corporate Headshots - TechCorp",
    description:
      "Professional headshots for the amazing team at TechCorp! Each person brought their unique personality to the shoot 💼 #CorporatePhotography #Headshots #Professional",
    location: "Manhattan, NY",
    date: "2024-11-10",
    images: ["/placeholder.svg?height=400&width=400"],
    comments: 7,
    shares: 5,
    tags: ["#corporate", "#headshots", "#professional"],
  },
  {
    id: 3,
    projectName: "Fashion Editorial Shoot",
    description:
      "Urban fashion photography in the heart of Brooklyn. The contrast between industrial architecture and flowing fabrics created pure magic 🏙️ #FashionPhotography #Brooklyn #Editorial",
    location: "Brooklyn, NY",
    date: "2024-11-05",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    comments: 32,
    shares: 28,
    tags: ["#fashion", "#editorial", "#brooklyn", "#urban"],
  },
  {
    id: 4,
    projectName: "Sunset Maternity Session",
    description:
      "Capturing the anticipation and joy of expecting parents during golden hour. There's nothing more beautiful than the glow of motherhood 🤱 #MaternityPhotography #Sunset #Expecting",
    location: "Prospect Park, NY",
    date: "2024-10-28",
    images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    comments: 24,
    shares: 15,
    tags: ["#maternity", "#sunset", "#family", "#expecting"],
  },
]

export default function PhotographerProfile() {
  const [availability, setAvailability] = useState("available")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleShare = (postId: number) => {
    // In a real app, this would open share dialog
    navigator.clipboard.writeText(`${window.location.origin}/photographer/profile?post=${postId}`)
    alert("Link copied to clipboard!")
  }

  const handleContact = () => {
    // In a real app, this would open contact modal or redirect to messaging
    alert("Contact feature would open messaging interface")
  }

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-2">
              <Link
                href="/photographer/dashboard"
                className="inline-flex items-center text-green-600 hover:text-green-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Instagram-style Profile Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" />
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">sarah_parker_photo</h1>
                    <p className="text-gray-600">Sarah Parker</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href="/photographer/post-work">
                      <Button className="bg-green-600 hover:bg-green-700">Share New Work</Button>
                    </Link>
                    <Button variant="outline" onClick={handleContact}>
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-8 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">127</p>
                    <p className="text-sm text-gray-600">posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">2.4k</p>
                    <p className="text-sm text-gray-600">connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">892</p>
                    <p className="text-sm text-gray-600">projects</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <p className="font-semibold">Wedding & Portrait Photographer</p>
                  <p className="text-gray-700">📍 New York, NY</p>
                  <p className="text-gray-700">✨ Capturing love stories & authentic moments</p>
                  <p className="text-gray-700">📧 sarah@sarahparkerphoto.com</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-gray-600">(127 reviews)</span>
                  </div>
                </div>

                {/* Availability Setting */}
                <div className="flex items-center space-x-4 mt-4">
                  <span className="text-sm font-medium">Availability:</span>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Available
                        </span>
                      </SelectItem>
                      <SelectItem value="busy">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          Busy
                        </span>
                      </SelectItem>
                      <SelectItem value="unavailable">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Unavailable
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram-style Feed */}
          <div className="space-y-8">
            {workPosts.map((post) => (
              <Card key={post.id} className="bg-white/95 backdrop-blur-sm overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>SP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">sarah_parker_photo</p>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{post.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Images */}
                <div className="relative">
                  {post.images.length === 1 ? (
                    <img
                      src={post.images[0] || "/placeholder.svg"}
                      alt={post.projectName}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => setSelectedImage(post.images[0])}
                    />
                  ) : (
                    <div
                      className={`grid gap-1 ${
                        post.images.length === 2
                          ? "grid-cols-2"
                          : post.images.length === 3
                            ? "grid-cols-3"
                            : "grid-cols-2"
                      }`}
                    >
                      {post.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${post.projectName} - Image ${index + 1}`}
                            className={`w-full object-cover cursor-pointer ${
                              post.images.length === 2
                                ? "h-96"
                                : post.images.length === 3
                                  ? "h-64"
                                  : index === 0
                                    ? "h-96 row-span-2"
                                    : "h-48"
                            }`}
                            onClick={() => setSelectedImage(image)}
                          />
                          {index === 3 && post.images.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageCircle className="h-6 w-6" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => handleShare(post.id)}>
                        <Share className="h-6 w-6" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Bookmark className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Comments and Engagement */}
                  <div className="space-y-1 mb-2">
                    <p className="text-sm">
                      <span className="font-semibold">sarah_parker_photo</span> {post.description}
                    </p>
                    {post.comments > 0 && (
                      <button className="text-sm text-gray-600">View all {post.comments} comments</button>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 uppercase">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" onClick={handleContact}>
                      <Phone className="h-3 w-3 mr-1" />
                      Contact Photographer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
