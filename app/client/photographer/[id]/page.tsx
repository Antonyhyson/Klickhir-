// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/client/saved-photographers/page.tsx
"use client"

import { useState, useEffect } => "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, CheckCircle, Camera, Star, Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast"

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

export default function SavedPhotographersPage() {
  const [savedPhotographers, setSavedPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedPhotographers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/favorites/photographers");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSavedPhotographers(data.savedPhotographers);
      } catch (e: any) {
        console.error("Failed to fetch saved photographers:", e);
        setError("Failed to load saved photographers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPhotographers();
  }, []); // Empty dependency array to run once on mount

  const handleUnsavePhotographer = async (photographerId: string) => {
    try {
      const response = await fetch("/api/favorites/photographers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographerId }),
      });

      if (response.ok) {
        setSavedPhotographers(prev => prev.filter(p => p.id !== photographerId));
        toast({ title: "Unsaved", description: "Photographer removed from your saved list.", variant: "default" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.error || "Failed to unsave photographer.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error unsaving photographer:", error);
      toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />
      <div className="relative z-10">
        {/* Header (similar to client dashboard) */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/50 dark:bg-slate-800/95 amoled:bg-black/95 dark:border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/client/dashboard" className="flex items-center space-x-3">
                <Briefcase className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                <span className="text-xl font-light tracking-wide bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent dark:from-white dark:via-slate-300 dark:to-white">
                  Saved Photographers
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
                <Link href="/client/jobs">
                    <Button className="refined-button-secondary font-light">My Jobs</Button>
                </Link>
                {/* User Avatar, etc. */}
                <Avatar className="ring-1 ring-slate-300 dark:ring-slate-600">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300">
                    CL
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-light text-slate-800 dark:text-white mb-8">Your Saved Photographers</h1>

          {loading && <p className="text-center text-gray-500">Loading saved photographers...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && savedPhotographers.length === 0 && (
            <div className="text-center p-8 border rounded-lg bg-white/50 backdrop-blur-sm">
              <p className="text-lg text-gray-600 mb-4">You haven't saved any photographers yet.</p>
              <Link href="/client/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Photographers</Button>
              </Link>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && savedPhotographers.map((photographer) => (
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
                        onClick={() => handleUnsavePhotographer(photographer.id)} // Unsave button
                    >
                        <BookmarkCheck className="h-4 w-4 mr-1" /> Unsave
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}