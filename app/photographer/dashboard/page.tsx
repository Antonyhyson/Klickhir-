// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/photographer/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Camera, Clock, DollarSign, Users, Briefcase, TrendingUp, Send } from "lucide-react" // Added Send icon
import { GlitterBackground } from "@/components/glitter-background"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog" // Import Dialog components
import { Textarea } from "@/components/ui/textarea" // Import Textarea
import { Input } from "@/components/ui/input" // Import Input
import { Label } from "@/components/ui/label" // Import Label
import { toast } from "@/hooks/use-toast" // Import toast for notifications


interface Job {
  id: string;
  title: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
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
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set()) // Keep track of applied jobs

  const fetchJobs = async (isCollaboration: boolean) => {
    if (isCollaboration) setLoadingCollaboration(true); else setLoadingNearby(true);
    if (isCollaboration) setErrorCollaboration(null); else setErrorNearby(null);

    try {
      const queryParams = new URLSearchParams({
        userType: "photographer",
        status: "open",
        collaboration: isCollaboration ? "true" : "false",
      }).toString();

      const response = await fetch(`/api/jobs?${queryParams}`);
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

  useEffect(() => {
    fetchJobs(false);
    fetchJobs(true);
  }, []);

  const handleApplyClick = (job: Job) => {
    setSelectedJobToApply(job);
    setApplicationMessage(`Dear ${job.client_first_name} ${job.client_last_name},\n\nI am very interested in your job posting "${job.title}". I believe my skills and experience would be a great fit for this project.\n\nLooking forward to discussing this further.\n\nBest regards,\n[Your Name]`);
    setProposedRate(job.budget.toString()); // Pre-fill with job's budget
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
        setAppliedJobs(prev => new Set(prev).add(selectedJobToApply.id)); // Mark job as applied
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

                {loadingNearby && <p className="text-center text-gray-500">Loading nearby jobs...</p>}
                {errorNearby && <p className="text-center text-red-500">{errorNearby}</p>}

                {!loadingNearby && !errorNearby && nearbyJobs.length === 0 && (
                  <p className="text-center text-gray-500">No nearby jobs found at the moment.</p>
                )}

                <div className="grid gap-6">
                  {!loadingNearby && !errorNearby && nearbyJobs.map((job) => (
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
                            <CardDescription>by {job.client_first_name} {job.client_last_name}</CardDescription>
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
                          <Button variant="outline">Save Job</Button>
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
            </TabsContent>

            <TabsContent value="collaboration" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Collaboration Opportunities</h2>
                  <Button variant="outline">View All</Button>
                </div>

                {loadingCollaboration && <p className="text-center text-gray-500">Loading collaboration opportunities...</p>}
                {errorCollaboration && <p className="text-center text-red-500">{errorCollaboration}</p>}

                {!loadingCollaboration && !errorCollaboration && collaborationJobs.length === 0 && (
                  <p className="text-center text-gray-500">No collaboration opportunities found at the moment.</p>
                )}

                <div className="grid gap-6">
                  {!loadingCollaboration && !errorCollaboration && collaborationJobs.map((job) => (
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
                            <CardDescription>by {job.client_first_name} {job.client_last_name}</CardDescription>
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
                              <Users className="h-4 w-4 mr-1 text-blue-600" />
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
                          <Button variant="outline">View Details</Button>
                          <Link href={`/messages?contact=${job.client_id}`}>
                            <Button variant="outline">Contact Team</Button>
                          </Link>
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
    </div>
  )
}