// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/client/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Clock, DollarSign, Search, Filter, Camera, CheckCircle, Users, Briefcase, Loader2, Bookmark, BookmarkCheck } from "lucide-react" // Added Bookmark, BookmarkCheck
import { SandFlow } from "@/components/sand-flow"
import { toast } from "@/hooks/use-toast" // Import toast

// interface for data from /api/photographers
interface Photographer {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  specialties: string[];
  hourlyRate: number;
  currency: string;
  availability: string;
  avatar: string;
  featured: boolean;
  verified: boolean;
  connections: number;
  projects: number;
  posts: number;
}

// interface for current user profile from /api/users/me
interface CurrentUserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image_url?: string;
    // Add other fields relevant to client profile if needed
}


export default function ClientDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterBy, setFilterBy] = useState("all")
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null); // New state for current user
  const [loadingUserProfile, setLoadingUserProfile] = useState(true);
  const [errorUserProfile, setErrorUserProfile] = useState<string | null>(null);

  const [savedPhotographerIds, setSavedPhotographerIds] = useState<Set<string>>(new Set()); // NEW: State to track saved photographers

  // Fetch current user's profile for the header avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUserProfile(true);
      setErrorUserProfile(null);
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        const data = await response.json();
        setCurrentUserProfile(data.user);
      } catch (e: any) {
        console.error("Error fetching user profile:", e);
        setErrorUserProfile("Failed to load user profile for header.");
      } finally {
        setLoadingUserProfile(false);
      }
    };
    fetchUserProfile();
  }, []); // Run once on mount


  // Fetch photographers data
  useEffect(() => {
    const fetchPhotographers = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams({
          search: searchTerm,
          sortBy: sortBy,
          filterBy: filterBy,
        }).toString()

        const response = await fetch(`/api/photographers?${queryParams}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const mappedPhotographers: Photographer[] = data.photographers.map((p: any) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          rating: p.rating || 0,
          reviews: p.total_reviews || 0,
          location: p.location_country,
          distance: p.distance || "N/A",
          specialties: p.specialties || [],
          hourlyRate: p.hourly_rate || 0,
          currency: p.currency || "USD",
          availability: p.availability_status || "available",
          avatar: p.profile_image_url || "/placeholder.svg?height=60&width=60",
          featured: p.featured || false,
          verified: p.is_verified || false,
          connections: p.connections || Math.floor(Math.random() * 2000),
          projects: p.projects || Math.floor(Math.random() * 100),
          posts: p.posts || Math.floor(Math.random() * 200),
        }));
        setPhotographers(mappedPhotographers)
      } catch (e: any) {
        console.error("Failed to fetch photographers:", e)
        setError("Failed to load photographers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const fetchSavedPhotographers = async () => {
      try {
        const response = await fetch("/api/favorites/photographers");
        if (response.ok) {
          const data = await response.json();
          setSavedPhotographerIds(new Set(data.savedPhotographers.map((p: any) => p.id)));
        } else {
          console.error("Failed to fetch saved photographers:", response.status);
        }
      } catch (e) {
        console.error("Error fetching saved photographers:", e);
      }
    };

    fetchPhotographers();
    fetchSavedPhotographers();
  }, [searchTerm, sortBy, filterBy]);

  const handleSavePhotographer = async (photographerId: string, isSaved: boolean) => {
    try {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch("/api/favorites/photographers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographerId }),
      });

      if (response.ok) {
        setSavedPhotographerIds(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(photographerId);
            toast({ title: "Unsaved", description: "Photographer removed from your saved list.", variant: "default" });
          } else {
            newSet.add(photographerId);
            toast({ title: "Saved!", description: "Photographer added to your saved list.", variant: "default" });
          }
          return newSet;
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


  const featuredPhotographers = photographers.filter((p) => p.featured);
  const allOtherPhotographers = photographers.filter((p) => !p.featured);

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
                  ChromaConnect
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
                <Link href="/client/jobs"> {/* Link to client job management page */}
                    <Button className="refined-button-secondary font-light">My Jobs</Button>
                </Link>
                {/* NEW: Link to Saved Photographers page */}
                <Link href="/client/saved-photographers">
                  <Button variant="outline" className="refined-button-secondary font-light">
                    <Bookmark className="h-4 w-4 mr-2" /> Saved Photographers
                  </Button>
                </Link>
                <div className="relative">
                  <Avatar className="ring-1 ring-slate-300 dark:ring-slate-600">
                    {loadingUserProfile ? (
                      <Loader2 className="h-full w-full animate-spin text-gray-400" />
                    ) : errorUserProfile ? (
                      <Users className="h-full w-full text-red-500" />
                    ) : (
                      <AvatarImage src={currentUserProfile?.profile_image_url || "/placeholder.svg?height=32&width=32"} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300">
                      {currentUserProfile ? `${currentUserProfile.first_name[0]}${currentUserProfile.last_name[0]}` : 'JD'}
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

          {loading && <p className="text-center text-gray-500">Loading photographers...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {/* Featured Photographers */}
              {featuredPhotographers.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center space-x-3 mb-8">
                    <h2 className="text-2xl font-light text-slate-800 dark:text-white">Featured</h2>
                    <div className="verification-dot"></div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPhotographers.map((photographer) => {
                      const isSaved = savedPhotographerIds.has(photographer.id); // Check if saved
                      return (
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
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 font-light bg-transparent"
                                onClick={() => handleSavePhotographer(photographer.id, isSaved)} // Save/Unsave button
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
                        </CardContent>
                      </Card>
                    )})}
                  </div>
                </div>
              )}

              {/* All Photographers */}
              {allOtherPhotographers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-light text-slate-800 dark:text-white mb-8">All Photographers</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allOtherPhotographers.map((photographer) => {
                      const isSaved = savedPhotographerIds.has(photographer.id); // Check if saved
                      return (
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
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 font-light bg-transparent"
                                onClick={() => handleSavePhotographer(photographer.id, isSaved)} // Save/Unsave button
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
                        </CardContent>
                      </Card>
                    )})}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}