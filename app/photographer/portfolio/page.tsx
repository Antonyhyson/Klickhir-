// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/photographer/portfolio/page.tsx
"use client"

import { useState, useEffect } from "react" // Import useEffect
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, MapPin, Camera, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"

// Define interfaces for fetched data
interface PhotographerProfile {
  id: string;
  name: string;
  username: string; // Derived from first_name, last_name
  bio: string;
  location: string; // Maps to location_country
  rating: number;
  reviews: number; // Maps to total_reviews
  followers: number; // Placeholder/mocked for now
  following: number; // Placeholder/mocked for now
  posts: number; // Actual count from DB
  avatar: string; // Maps to profile_image_url
  specialties: string[];
  hourlyRate: number; // Maps to hourly_rate
  currency: string;
  is_verified: boolean; // From users table
}

interface PortfolioPost {
  id: string; // Changed to string to match UUID
  project_name: string;
  description: string;
  location: string;
  project_date: string; // Maps to project_date
  images: string[];
  likes?: number; // Not directly in DB, keep for mock compatibility or add a likes table
  comments?: number; // Not directly in DB, keep for mock compatibility or add a comments table
  shares?: number; // Not directly in DB, keep for mock compatibility
}


export default function PhotographerPortfolio() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null)
  const [posts, setPosts] = useState<PortfolioPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch photographer profile
        const profileResponse = await fetch("/api/users/me")
        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`)
        }
        const profileData = await profileResponse.json()
        setPhotographer(profileData.user)

        // Fetch portfolio posts for the authenticated photographer
        const postsResponse = await fetch("/api/portfolio") // No photographerId needed, token identifies
        if (!postsResponse.ok) {
          throw new Error(`Failed to fetch posts: ${postsResponse.statusText}`)
        }
        const postsData = await postsResponse.json()

        // Map posts data to match interface and add mock engagement if not in DB
        const mappedPosts: PortfolioPost[] = postsData.posts.map((post: any) => ({
          id: post.id,
          project_name: post.project_name,
          description: post.description,
          location: post.location,
          project_date: new Date(post.project_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          images: post.images,
          likes: Math.floor(Math.random() * 1000) + 50, // Mock likes
          comments: Math.floor(Math.random() * 50) + 5,  // Mock comments
          shares: Math.floor(Math.random() * 30) + 2,   // Mock shares
        }));
        setPosts(mappedPosts)

      } catch (err: any) {
        console.error("Error fetching portfolio data:", err)
        setError("Failed to load portfolio. Please ensure you are logged in as a photographer.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this runs once on mount


  const handleShare = (postId: string) => { // postId is now string
    if (photographer) {
      navigator.clipboard.writeText(`${window.location.origin}/photographer/portfolio/${photographer.id}?post=${postId}`)
      alert("Link copied to clipboard!")
    } else {
      alert("Photographer profile not loaded yet. Cannot share.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Loading portfolio...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">{error}</p>
      </div>
    )
  }

  if (!photographer) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">No photographer profile found.</p>
      </div>
    )
  }


  return (
    <div className="min-h-screen relative">
      <GlitterBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/photographer/dashboard"
                className="inline-flex items-center text-green-600 hover:text-green-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-green-600" />
                <span className="font-semibold">ClickHire</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Portfolio
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Instagram-style Profile Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={photographer.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {photographer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{photographer.username}</h1>
                    <p className="text-gray-600">{photographer.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href="/photographer/post-work">
                      <Button className="bg-green-600 hover:bg-green-700">Share New Work</Button>
                    </Link>
                    <Link href="/photographer/profile">
                      <Button variant="outline">Edit Profile</Button> {/* Link to own profile edit page */}
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-8 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{photographer.posts}</p>
                    <p className="text-sm text-gray-600">posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{photographer.followers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{photographer.following}</p>
                    <p className="text-sm text-gray-600">following</p>
                  </div>
                </div>

                {/* Bio and Stats */}
                <div className="space-y-2">
                  <p className="font-semibold">Wedding & Portrait Photographer</p> {/* This should ideally come from specialties */}
                  <p className="text-gray-700">📍 {photographer.location}</p>
                  <p className="text-gray-700">✨ {photographer.bio}</p> {/* Use fetched bio */}
                  <p className="text-gray-700">📧 {photographer.email}</p> {/* Display email from fetched data */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{photographer.rating}</span>
                      <span className="text-gray-600">({photographer.reviews} reviews)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">
                        ${photographer.hourlyRate} {photographer.currency}/hr
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photographer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram-style Feed */}
          <div className="space-y-8">
            {posts.length === 0 && !loading && (
              <p className="text-center text-gray-500">No portfolio posts found yet.</p>
            )}
            {posts.map((post) => (
              <Card key={post.id} className="bg-white/95 backdrop-blur-sm overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={photographer.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {photographer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{photographer.username}</p>
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
                      alt={post.project_name}
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
                            alt={`${post.project_name} - Image ${index + 1}`}
                            className={`w-full object-cover cursor-pointer ${
                              post.images.length === 2
                                ? "h-96"
                                : post.images.length === 3
                                  ?