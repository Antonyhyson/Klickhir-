// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/photographer/saved-jobs/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Camera, Star, Briefcase, Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast"

interface Job {
  id: string;
  title: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  client_rating?: number;
  location: string;
  distance: string;
  job_date: string;
  job_time: string;
  duration_hours: number;
  budget: number;
  currency: string;
  photography_type: string;
  is_urgent: boolean;
  description: string;
  is_collaboration: boolean;
  photographers_needed?: number;
  application_count?: number;
  status?: string;
  is_featured?: boolean;
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/favorites/jobs");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSavedJobs(data.savedJobs);
      } catch (e: any) {
        console.error("Failed to fetch saved jobs:", e);
        setError("Failed to load saved jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []); // Empty dependency array to run once on mount

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const response = await fetch("/api/favorites/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
        toast({ title: "Unsaved", description: "Job removed from your saved list.", variant: "default" });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.error || "Failed to unsave job.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />
      <div className="relative z-10">
        {/* Header (similar to photographer dashboard) */}
        <header className="bg-white/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            <Link href="/photographer/dashboard" className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-green-600" />
                <span className="text-xl font-bold">Klickhiré</span>
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
                <Link href="/photographer/profile">
                    <Button variant="outline">Settings</Button>
                </Link>
                {/* User Avatar, etc. */}
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-light text-slate-800 dark:text-white mb-8">Your Saved Jobs</h1>

          {loading && <p className="text-center text-gray-500">Loading saved jobs...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && savedJobs.length === 0 && (
            <div className="text-center p-8 border rounded-lg bg-white/50 backdrop-blur-sm">
              <p className="text-lg text-gray-600 mb-4">You haven't saved any jobs yet.</p>
              <Link href="/photographer/dashboard">
                <Button className="bg-green-600 hover:bg-green-700">Browse Jobs</Button>
              </Link>
            </div>
          )}

          <div className="grid gap-6">
            {!loading && savedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.is_urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {job.photography_type}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center space-x-2">
                        <span>by {job.client_first_name} {job.client_last_name}</span>
                        {job.client_rating !== undefined && job.client_rating > 0 && (
                          <span className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                            {job.client_rating.toFixed(1)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${job.budget.toLocaleString()} {job.currency}
                      </p>
                      <p className="text-sm text-gray-600">{job.duration_hours} hours</p>
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
                        <span>{job.job_date} at {job.job_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    {/* Placeholder for Apply button logic */}
                    <Button
                      className="flex-1"
                      variant="outline"
                      disabled // Disable apply as this is a saved job list
                    >
                      View Details
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleUnsaveJob(job.id)} // Unsave button
                    >
                        <BookmarkCheck className="h-4 w-4 mr-1" /> Unsave Job
                    </Button>
                    <Link href={`/messages?contact=${job.client_id}`}>
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
      </div>
    </div>
  )
}