// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5d693145d19c7114/app/photographer/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Camera, Clock, DollarSign, Users, Briefcase, TrendingUp, Send, Loader2, Filter, X, Calendar as CalendarIcon, Bookmark, BookmarkCheck } from "lucide-react" // Added Bookmark, BookmarkCheck
import { GlitterBackground } from "@/components/glitter-background"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Job {
  id: string;
  title: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  client_rating?: number; // NEW: Client's average rating
  location: string;
  distance?: string;
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

interface DashboardStats {
  activeJobs: number;
  rating: string;
  thisMonthEarnings: string;
  successRate: string;
}

// Interface for current user profile from /api/users/me (photographer specific)
interface CurrentUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
  // Add other fields relevant to photographer profile if needed, like specialties
}


const photographyTypes = [
  "Wedding Photography", "Portrait Photography", "Event Photography",
  "Corporate Photography", "Product Photography", "Fashion Photography",
  "Real Estate Photography", "Food Photography", "Travel Photography",
  "Street Photography", "Documentary Photography", "Commercial Photography",
];

export default function PhotographerDashboard() {
  const [activeTab, setActiveTab] = useState("nearby")
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([])
  const [collaborationJobs, setCollaborationJobs] = useState<Job[]>([])
  const [loadingNearby, setLoadingNearby] = useState(true)
  const [loadingCollaboration, setLoadingCollaboration] = useState(true)
  const [errorNearby, setErrorNearby] = useState<string | null>(null)
  const [errorCollaboration, setErrorCollaboration] = useState<string | null>(null)

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [proposedRate, setProposedRate] = useState("")
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true); // CORRECTED LINE
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterJobType, setFilterJobType] = useState<string | null>(null);
  const [filterMinBudget, setFilterMinBudget] = useState<string>("");
  const [filterMaxBudget, setFilterMaxBudget] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<"true" | "false" | null>(null);
  const [filterMinDate, setFilterMinDate] = useState<Date | undefined>(undefined);
  const [filterMaxDate, setFilterMaxDate] = useState<Date | undefined>(undefined);
  const [filterMinClientRating, setFilterMinClientRating] = useState<string | null>(null);

  const [appliedFilters, setAppliedFilters] = useState({
    type: null as string | null,
    minBudget: "",
    maxBudget: "",
    urgency: null as "true" | "false" | null,
    minDate: undefined as Date | undefined,
    maxDate: undefined as Date | undefined,
    minClientRating: null as string | null,
  });

  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(true);
  const [errorUserProfile, setErrorUserProfile] = useState<string | null>(null);

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set()); // NEW: State to track saved jobs


  // Fetch current user's profile for the header avatar/links
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
  }, []);


  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const response = await fetch("/api/photographer/dashboard-stats");
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        const data = await response.json();
        setDashboardStats(data);
      } catch (e: any) {
        console.error("Error fetching photographer dashboard stats:", e);
        setErrorStats("Failed to load dashboard stats.");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardStats();
  }, []);


  // Fetch job listings - now includes filters
  useEffect(() => {
    const fetchJobs = async (isCollaboration: boolean) => {
      if (isCollaboration) setLoadingCollaboration(true); else setLoadingNearby(true);
      if (isCollaboration) setErrorCollaboration(null); else setErrorNearby(null);

      try {
        const queryParams = new URLSearchParams({
          userType: "photographer",
          status: "open",
          collaboration: isCollaboration ? "true" : "false",
        });

        if (appliedFilters.type) queryParams.append("photographyType", appliedFilters.type);
        if (appliedFilters.minBudget) queryParams.append("minBudget", appliedFilters.minBudget);
        if (appliedFilters.maxBudget) queryParams.append("maxBudget", appliedFilters.maxBudget);
        if (appliedFilters.urgency) queryParams.append("isUrgent", appliedFilters.urgency);
        if (appliedFilters.minDate) queryParams.append("minDate", format(appliedFilters.minDate, "yyyy-MM-dd"));
        if (appliedFilters.maxDate) queryParams.append("maxDate", format(appliedFilters.maxDate, "yyyy-MM-dd"));
        if (appliedFilters.minClientRating) queryParams.append("minClientRating", appliedFilters.minClientRating);


        const response = await fetch(`/api/jobs?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const mappedJobs: Job[] = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          client_id: job.client_id,
          client_first_name: job.first_name,
          client_last_name: job.last_name,
          client_rating: job.client_rating, // Map client rating
          location: job.location,
          distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`,
          job_date: new Date(job.job_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          job_time: job.job_time.substring(0, 5),
          duration_hours: job.duration_hours,
          budget: job.budget,
          currency: job.currency,
          photography_type: job.photography_type,
          is_urgent: job.is_urgent,
          description: job.description,
          is_collaboration: job.is_collaboration,
          photographers_needed: job.photographers_needed,
          application_count: job.application_count,
          status: job.status,
          is_featured: job.is_featured || (isCollaboration && Math.random() > 0.5)
        }));

        if (isCollaboration) {
          setCollaborationJobs(mappedJobs);
        } else {
          setNearbyJobs(mappedJobs);
        }
      } catch (e: any) {
        console.error(`Failed to fetch ${isCollaboration ? 'collaboration' : 'nearby'} jobs:`, e);
        if (isCollaboration) setErrorCollaboration("Failed to load collaboration jobs.");
        else setErrorNearby("Failed to load nearby jobs.");
      } finally {
        if (isCollaboration) setLoadingCollaboration(false); else setLoadingNearby(false);
      }
    };

    // NEW: Fetch saved jobs
    const fetchSavedJobs = async () => {
      try {
        const response = await fetch("/api/favorites/jobs");
        if (response.ok) {
          const data = await response.json();
          setSavedJobIds(new Set(data.savedJobs.map((job: any) => job.id)));
        } else {
          console.error("Failed to fetch saved jobs:", response.status);
        }
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
      }
    };

    fetchJobs(false);
    fetchJobs(true);
    fetchSavedJobs(); // Fetch saved jobs on mount and filter changes
  }, [appliedFilters.type, appliedFilters.minBudget, appliedFilters.maxBudget, appliedFilters.urgency, appliedFilters.minDate, appliedFilters.maxDate, appliedFilters.minClientRating]);


  const handleApplyClick = (job: Job) => {
    setSelectedJobToApply(job);
    setApplicationMessage(`Dear ${job.client_first_name} ${job.client_last_name},\n\nI am very interested in your job posting "${job.title}". I believe my skills and experience would be a great fit for this project.\n\nLooking forward to discussing this further.\n\nBest regards,\n[Your Name]`);
    setProposedRate(job.budget.toString());
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJobToApply) return;

    setIsSubmittingApplication(true);
    try {
      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobToApply.id,
          message: applicationMessage,
          proposedRate: proposedRate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Application Submitted!",
          description: data.message,
          variant: "default",
        });
        setAppliedJobs(prev => new Set(prev).add(selectedJobToApply.id));
        setIsApplyModalOpen(false);
        setSelectedJobToApply(null);
        setApplicationMessage("");
        setProposedRate("");
      } else {
        toast({
          title: "Application Failed",
          description: data.error || "There was an issue submitting your application.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Network Error",
        description: "Could not submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      type: filterJobType,
      minBudget: filterMinBudget,
      maxBudget: filterMaxBudget,
      urgency: filterUrgency,
      minDate: filterMinDate,
      maxDate: filterMaxDate,
      minClientRating: filterMinClientRating,
    });
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilterJobType(null);
    setFilterMinBudget("");
    setFilterMaxBudget("");
    setFilterUrgency(null);
    setFilterMinDate(undefined);
    setFilterMaxDate(undefined);
    setFilterMinClientRating(null);
    setAppliedFilters({
      type: null,
      minBudget: "",
      maxBudget: "",
      urgency: null,
      minDate: undefined,
      maxDate: undefined,
      minClientRating: null,
    });
    setIsFilterModalOpen(false);
  };

  const isAnyFilterActive =
    appliedFilters.type ||
    appliedFilters.minBudget ||
    appliedFilters.maxBudget ||
    appliedFilters.urgency ||
    appliedFilters.minDate ||
    appliedFilters.maxDate ||
    appliedFilters.minClientRating;

  // NEW: Handle save/unsave job
  const handleSaveJob = async (jobId: string, isSaved: boolean) => {
    try {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch("/api/favorites/jobs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          if (isSaved) {
            newSet.delete(jobId);
            toast({ title: "Unsaved", description: "Job removed from your saved list.", variant: "default" });
          } else {
            newSet.add(jobId);
            toast({ title: "Saved!", description: "Job added to your saved list.", variant: "default" });
          }
          return newSet;
        });
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.error || "Failed to update saved status.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving/unsaving job:", error);
      toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
    }
  };


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
                <span className="text-xl font-bold">ChromaConnect</span>
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
                {/* NEW: Link to Saved Jobs page */}
                <Link href="/photographer/saved-jobs">
                  <Button variant="outline" className="refined-button-secondary font-light">
                    <Bookmark className="h-4 w-4 mr-2" /> Saved Jobs
                  </Button>
                </Link>
                <Link href="/settings"> {/* Changed link to /settings */}
                    <Button variant="outline">Settings</Button>
                </Link>
                <Link href="/photographer/profile"> {/* Make Avatar clickable to profile */}
                    <Avatar>
                        {loadingUserProfile ? (
                            <Loader2 className="h-full w-full animate-spin text-gray-400" />
                        ) : errorUserProfile ? (
                            // Fallback icon on error
                            <Users className="h-full w-full text-red-500" />
                        ) : (
                            <AvatarImage src={currentUserProfile?.profile_image_url || "/placeholder.svg?height=32&width=32"} />
                        )}
                        <AvatarFallback>
                            {currentUserProfile ? `${currentUserProfile.first_name[0]}${currentUserProfile.last_name[0]}` : 'SP'}
                        </AvatarFallback>
                    </Avatar>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {loadingStats ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <div>
                          <p className="text-2xl font-bold">---</p>
                          <p className="text-sm text-gray-600">Loading...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : errorStats ? (
              <Card className="col-span-full border-red-500">
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Error Loading Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">{errorStats}</p>
                </CardContent>
              </Card>
            ) : dashboardStats ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{dashboardStats.activeJobs}</p>
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
                        <p className="text-2xl font-bold">{dashboardStats.rating}</p>
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
                        <p className="text-2xl font-bold">${dashboardStats.thisMonthEarnings}</p> {/* Removed K, assuming API formats correctly */}
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
                        <p className="text-2xl font-bold">{dashboardStats.successRate}%</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
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
                  <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
                    <Filter className="mr-2 h-4 w-4" /> Filter Jobs
                  </Button>
                </div>

                {isAnyFilterActive && (
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>Active Filters:</span>
                        {appliedFilters.type && <Badge variant="secondary">{appliedFilters.type} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterJobType(null); setAppliedFilters(prev => ({ ...prev, type: null })); }} /></Badge>}
                        {appliedFilters.minBudget && <Badge variant="secondary">Min Budget: ${appliedFilters.minBudget} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMinBudget(""); setAppliedFilters(prev => ({ ...prev, minBudget: "" })); }} /></Badge>}
                        {appliedFilters.maxBudget && <Badge variant="secondary">Max Budget: ${appliedFilters.maxBudget} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMaxBudget(""); setAppliedFilters(prev => ({ ...prev, maxBudget: "" })); }} /></Badge>}
                        {appliedFilters.urgency && <Badge variant="secondary">Urgent: {appliedFilters.urgency === "true" ? "Yes" : "No"} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterUrgency(null); setAppliedFilters(prev => ({ ...prev, urgency: null })); }} /></Badge>}
                        {appliedFilters.minDate && <Badge variant="secondary">From: {format(appliedFilters.minDate, "MMM dd, yyyy")} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMinDate(undefined); setAppliedFilters(prev => ({ ...prev, minDate: undefined })); }} /></Badge>}
                        {appliedFilters.maxDate && <Badge variant="secondary">To: {format(appliedFilters.maxDate, "MMM dd, yyyy")} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMaxDate(undefined); setAppliedFilters(prev => ({ ...prev, maxDate: undefined })); }} /></Badge>}
                        {appliedFilters.minClientRating && <Badge variant="secondary">Client Rating: {appliedFilters.minClientRating}+ <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMinClientRating(null); setAppliedFilters(prev => ({ ...prev, minClientRating: null })); }} /></Badge>}
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-blue-500 hover:underline">Clear All</Button>
                    </div>
                )}

                {loadingNearby && <p className="text-center text-gray-500">Loading nearby jobs...</p>}
                {errorNearby && <p className="text-center text-red-500">{errorNearby}</p>}

                {!loadingNearby && !errorNearby && nearbyJobs.length === 0 && (
                  <p className="text-center text-gray-500">No nearby jobs found at the moment.</p>
                )}

                <div className="grid gap-6">
                  {!loadingNearby && !errorNearby && nearbyJobs.map((job) => {
                    const isSaved = savedJobIds.has(job.id); // Check if job is saved
                    return (
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

                        <div className="flex space-x-3 pt-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleApplyClick(job)}
                            disabled={appliedJobs.has(job.id)}
                          >
                            {appliedJobs.has(job.id) ? "Applied" : "Apply Now"}
                          </Button>
                          <Button
                              variant="outline"
                              onClick={() => handleSaveJob(job.id, isSaved)} // Save/Unsave button
                          >
                              {isSaved ? (
                                  <>
                                      <BookmarkCheck className="h-4 w-4 mr-1" /> Unsave Job
                                  </>
                              ) : (
                                  <>
                                      <Bookmark className="h-4 w-4 mr-1" /> Save Job
                                  </>
                              )}
                          </Button>
                          <Link href={`/messages?contact=${job.client_id}`}>
                            <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                              Message Client
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Collaboration Opportunities</h2>
                  <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
                    <Filter className="mr-2 h-4 w-4" /> Filter Jobs
                  </Button>
                </div>
                {isAnyFilterActive && (
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>Active Filters:</span>
                        {appliedFilters.type && <Badge variant="secondary">{appliedFilters.type} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterJobType(null); setAppliedFilters(prev => ({ ...prev, type: null })); }} /></Badge>}
                        {appliedFilters.minBudget && <Badge variant="secondary">Min Budget: ${appliedFilters.minBudget} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMinBudget(""); setAppliedFilters(prev => ({ ...prev, minBudget: "" })); }} /></Badge>}
                        {appliedFilters.maxBudget && <Badge variant="secondary">Max Budget: ${appliedFilters.maxBudget} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMaxBudget(""); setAppliedFilters(prev => ({ ...prev, maxBudget: "" })); }} /></Badge>}
                        {appliedFilters.urgency && <Badge variant="secondary">Urgent: {appliedFilters.urgency === "true" ? "Yes" : "No"} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterUrgency(null); setAppliedFilters(prev => ({ ...prev, urgency: null })); }} /></Badge>}
                        {appliedFilters.minDate && <Badge variant="secondary">From: {format(appliedFilters.minDate, "MMM dd, yyyy")} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMinDate(undefined); setAppliedFilters(prev => ({ ...prev, minDate: undefined })); }} /></Badge>}
                        {appliedFilters.maxDate && <Badge variant="secondary">To: {format(appliedFilters.maxDate, "MMM dd, yyyy")} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMaxDate(undefined); setAppliedFilters(prev => ({ ...prev, maxDate: undefined })); }} /></Badge>}
                        {appliedFilters.minClientRating && <Badge variant="secondary">Client Rating: {appliedFilters.minClientRating}+ <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => { setFilterMinClientRating(null); setAppliedFilters(prev => ({ ...prev, minClientRating: null })); }} /></Badge>}
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-blue-500 hover:underline">Clear All</Button>
                    </div>
                )}
                {loadingCollaboration && <p className="text-center text-gray-500">Loading collaboration opportunities...</p>}
                {errorCollaboration && <p className="text-center text-red-500">{errorCollaboration}</p>}

                {!loadingCollaboration && !errorCollaboration && collaborationJobs.length === 0 && (
                  <p className="text-center text-gray-500">No collaboration opportunities found at the moment.</p>
                )}

                <div className="grid gap-6">
                  {!loadingCollaboration && !errorCollaboration && collaborationJobs.map((job) => {
                    const isSaved = savedJobIds.has(job.id); // Check if job is saved
                    return (
                    <Card
                      key={job.id}
                      className={`hover:shadow-lg transition-shadow ${job.is_featured ? "border-2 border-yellow-200" : ""}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-xl">{job.title}</CardTitle>
                              {job.is_featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
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
                              <span>{job.job_date}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{job.photographers_needed} photographers needed</span>
                            </div>
                            <div className="text-gray-600">{job.application_count || 0} applicants</div>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleApplyClick(job)}
                            disabled={appliedJobs.has(job.id)}
                          >
                            {appliedJobs.has(job.id) ? "Applied" : "Join Collaboration"}
                          </Button>
                          <Button
                              variant="outline"
                              onClick={() => handleSaveJob(job.id, isSaved)} // Save/Unsave button
                          >
                              {isSaved ? (
                                  <>
                                      <BookmarkCheck className="h-4 w-4 mr-1" /> Unsave Job
                                  </>
                              ) : (
                                  <>
                                      <Bookmark className="h-4 w-4 mr-1" /> Save Job
                                  </>
                              )}
                          </Button>
                          <Link href={`/messages?contact=${job.client_id}`}>
                            <Button variant="outline">Contact Team</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Apply Job Modal */}
      {selectedJobToApply && (
        <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Apply for "{selectedJobToApply.title}"</DialogTitle>
              <DialogDescription>
                Submit your application to {selectedJobToApply.client_first_name} {selectedJobToApply.client_last_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="proposedRate">Proposed Rate ({selectedJobToApply.currency})</Label>
                <Input
                  id="proposedRate"
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder={selectedJobToApply.budget.toString()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message to Client</Label>
                <Textarea
                  id="message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={5}
                  placeholder="Introduce yourself and your relevant experience..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitApplication} disabled={isSubmittingApplication}>
                {isSubmittingApplication ? "Submitting..." : "Submit Application"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Filter Jobs Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Jobs</DialogTitle>
            <DialogDescription>
              Apply filters to find specific job opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filterJobType">Photography Type</Label>
              <Select
                value={filterJobType || ""}
                onValueChange={(value) => setFilterJobType(value === "" ? null : value)}
              >
                <SelectTrigger id="filterJobType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {photographyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterMinBudget">Budget Range (USD)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="filterMinBudget"
                  type="number"
                  placeholder="Min"
                  value={filterMinBudget}
                  onChange={(e) => setFilterMinBudget(e.target.value)}
                  min="0"
                />
                <span>-</span>
                <Input
                  id="filterMaxBudget"
                  type="number"
                  placeholder="Max"
                  value={filterMaxBudget}
                  onChange={(e) => setFilterMaxBudget(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterUrgency">Urgency</Label>
              <Select
                value={filterUrgency || ""}
                onValueChange={(value) => setFilterUrgency(value === "" ? null : (value as "true" | "false"))}
              >
                <SelectTrigger id="filterUrgency">
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Urgent Only</SelectItem>
                  <SelectItem value="false">Not Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterMinDate">Job Date Range</Label>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterMinDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterMinDate ? format(filterMinDate, "PPP") : <span>Start Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterMinDate}
                      onSelect={setFilterMinDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span>-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterMaxDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterMaxDate ? format(filterMaxDate, "PPP") : <span>End Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterMaxDate}
                      onSelect={setFilterMaxDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterMinClientRating">Minimum Client Rating</Label>
              <Select
                value={filterMinClientRating || ""}
                onValueChange={(value) => setFilterMinClientRating(value === "" ? null : value)}
              >
                <SelectTrigger id="filterMinClientRating">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5 Stars & Up</SelectItem>
                  <SelectItem value="4">4 Stars & Up</SelectItem>
                  <SelectItem value="3.5">3.5 Stars & Up</SelectItem>
                  <SelectItem value="3">3 Stars & Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}