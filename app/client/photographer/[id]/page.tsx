// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/client/photographer/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, MapPin, Phone, Share, MessageCircle, Bookmark, MoreHorizontal, Camera, BookmarkCheck } from "lucide-react" // Added BookmarkCheck
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast" // Import toast for notifications


interface PhotographerProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  rating: number;
  reviews: number;
  connections: number;
  projects: number;
  posts: number;
  avatar: string;
  specialties: string[];
  hourlyRate: number;
  currency: string;
  isClient: boolean;
  is_verified?: boolean;
  email?: string;
}

interface PortfolioPost {
  id: string;
  project_name: string;
  description: string;
  location: string;
  project_date: string;
  images: string[];
  comments?: number;
  shares?: number;
  likes?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string; // From DB timestamp
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  clientProfileImageUrl?: string;
}


export default function ClientPhotographerView() {
  const { id } = useParams<{ id: string }>()
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null)
  const [posts, setPosts] = useState<PortfolioPost[]>([])
  const [reviews, setReviews] = useState<Review[]>([]) // New state for reviews
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingReviews, setLoadingReviews] = useState(true) // New loading state for reviews
  const [reviewsError, setReviewsError] = useState<string | null>(null) // New error state for reviews
  const [isSaved, setIsSaved] = useState(false); // NEW: State to track if photographer is saved


  useEffect(() => {
    if (!id) {
      setError("Photographer ID not provided.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch photographer profile details
        const profileResponse = await fetch(`/api/photographers?id=${id}`);
        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch photographer profile: ${profileResponse.statusText}`);
        }
        const profileData = await profileResponse.json();

        const mappedPhotographer: PhotographerProfile = {
          ...profileData.photographer,
          name: profileData.photographer.name,
          username: profileData.photographer.username,
          bio: profileData.photographer.bio || "No bio provided.",
          location: profileData.photographer.location,
          rating: profileData.photographer.rating || 0,
          reviews: profileData.photographer.reviews || 0,
          connections: profileData.photographer.connections || 0,
          projects: profileData.photographer.projects || 0,
          posts: profileData.photographer.posts || 0,
          avatar: profileData.photographer.avatar || "/placeholder.svg?height=128&width=128",
          specialties: profileData.photographer.specialties || [],
          hourlyRate: profileData.photographer.hourly_rate || 0,
          currency: profileData.photographer.currency || "USD",
          isClient: true, // This page is viewed by a client
          is_verified: profileData.photographer.is_verified,
          email: profileData.photographer.email,
        };
        setPhotographer(mappedPhotographer);


        // Fetch portfolio posts for this photographer
        const postsResponse = await fetch(`/api/portfolio?photographerId=${id}`);
        if (!postsResponse.ok) {
          throw new Error(`Failed to fetch portfolio posts: ${postsResponse.statusText}`);
        }
        const postsData = await postsResponse.json();

        const mappedPosts: PortfolioPost[] = postsData.posts.map((post: any) => ({
          id: post.id,
          project_name: post.project_name,
          description: post.description,
          location: post.location,
          project_date: new Date(post.project_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          images: post.images,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 30) + 2,
          likes: Math.floor(Math.random() * 1000) + 50,
        }));
        setPosts(mappedPosts);

      } catch (e: any) {
        console.error("Error fetching photographer view data:", e);
        setError("Failed to load photographer profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewsError(null);
      try {
        const response = await fetch(`/api/reviews?photographerId=${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        const data = await response.json();
        const fetchedReviews: Review[] = data.reviews.map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          // Add client avatar if it's consistently returned or derive fallback
          clientProfileImageUrl: review.clientProfileImageUrl || "/placeholder.svg?height=40&width=40",
        }));
        setReviews(fetchedReviews);
      } catch (e: any) {
        console.error("Error fetching reviews:", e);
        setReviewsError("Failed to load reviews.");
      } finally {
        setLoadingReviews(false);
      }
    };

    // NEW: Fetch saved status for this photographer
    const fetchSavedStatus = async () => {
      try {
        const response = await fetch("/api/favorites/photographers");
        if (response.ok) {
          const data = await response.json();
          const savedIds = new Set(data.savedPhotographers.map((p: any) => p.id));
          setIsSaved(savedIds.has(id));
        } else {
          console.error("Failed to fetch saved photographers for status check:", response.status);
        }
      } catch (e) {
        console.error("Error fetching saved status:", e);
      }
    };


    fetchData();
    fetchReviews(); // Fetch reviews concurrently
    fetchSavedStatus(); // NEW: Fetch saved status
  }, [id]);


  const handleShare = (postId: string) => {
    if (photographer) {
      navigator.clipboard.writeText(`${window.location.origin}/client/photographer/${photographer.id}?post=${postId}`);
      alert("Link copied to clipboard!");
    } else {
      alert("Photographer profile not loaded yet. Cannot share.");
    }
  }

  const handleContact = () => {
    if (photographer?.id) {
      window.location.href = `/messages?contact=${photographer.id}`
    } else {
      alert("Photographer ID not available for contact.");
    }
  }

  // NEW: Handle save/unsave photographer
  const handleSavePhotographer = async () => {
    if (!id) return; // Ensure photographer ID is available

    try {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch("/api/favorites/photographers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographerId: id }),
      });

      if (response.ok) {
        setIsSaved(prev => !prev); // Toggle saved state
        toast({
          title: isSaved ? "Unsaved" : "Saved!",
          description: isSaved ? "Photographer removed from your saved list." : "Photographer added to your saved list.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.error || "Failed to update saved status.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving/unsaving photographer:", error);
      toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Loading photographer profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Photographer profile not found.</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen relative">
      <GlitterBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/client/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">ChromaConnect</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Client View
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
                  {photographer.isClient && ( // This is for client viewing photographer's profile
                    <div className="flex space-x-2">
                      <Button onClick={handleContact}>
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button variant="outline" onClick={() => handleShare("0")}>
                        <Share className="h-4 w-4 mr-1" />
                        Share Profile
                      </Button>
                      <Button
                          variant="outline"
                          onClick={handleSavePhotographer} // NEW: Save/Unsave button for profile view
                      >
                          {isSaved ? (
                              <>
                                  <BookmarkCheck className="h-4 w-4 mr-1" /> Unsave
                              </>
                          ) : (
                              <>
                                  <Bookmark className="h-4 w-4 mr-1" /> Save
                              </>
                          )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex space-x-8 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{photographer.posts}</p>
                    <p className="text-sm text-gray-600">posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{photographer.connections.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{photographer.projects}</p>
                    <p className="text-sm text-gray-600">projects</p>
                  </div>
                </div>

                {/* Bio and Professional Info */}
                <div className="space-y-2">
                  <p className="font-semibold">Wedding & Portrait Photographer</p>
                  <p className="text-gray-700">📍 {photographer.location}</p>
                  <p className="text-gray-700">✨ {photographer.bio}</p>
                  <p className="text-gray-700">📧 {photographer.email}</p>
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

          {/* Reviews Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Reviews ({photographer.reviews})</h2>
            {loadingReviews && <p className="text-center text-gray-500">Loading reviews...</p>}
            {reviewsError && <p className="text-center text-red-500">{reviewsError}</p>}
            {!loadingReviews && !reviewsError && reviews.length === 0 && (
              <p className="text-center text-gray-500">No reviews yet for this photographer.</p>
            )}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.clientProfileImageUrl || "/placeholder.svg"} />
                    <AvatarFallback>
                      {review.clientFirstName[0]}{review.clientLastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{review.clientFirstName} {review.clientLastName}</p>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">Reviewed on {review.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instagram-style Feed */}
          <div className="space-y-8">
            {posts.length === 0 && !loading && (
              <p className="text-center text-gray-500">No portfolio posts found for this photographer.</p>
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

                  {/* Comments */}
                  <div className="space-y-1 mb-2">
                    <p className="text-sm">
                      <span className="font-semibold">{photographer.username}</span> {post.description}
                    </p>
                    {post.comments && post.comments > 0 && (
                      <button className="text-sm text-gray-600">View all {post.comments} comments</button>
                    )}
                  </div>

                  {/* Date and Contact */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 uppercase">
                      {post.project_date}
                    </p>
                    {photographer.isClient && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs" onClick={handleContact}>
                        <Phone className="h-3 w-3 mr-1" />
                        Contact Photographer
                      </Button>
                    )}
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