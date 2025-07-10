// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/client/jobs/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users, CheckCircle, XCircle, MessageCircle, Star } from "lucide-react" // Added Star for rating input
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog, // New Import
  AlertDialogAction, // New Import
  AlertDialogCancel, // New Import
  AlertDialogContent, // New Import
  AlertDialogDescription, // New Import
  AlertDialogFooter, // New Import
  AlertDialogHeader, // New Import
  AlertDialogTitle, // New Import
} from "@/components/ui/alert-dialog" // New Import

interface Job {
  id: string;
  title: string;
  description: string;
  photography_type: string;
  duration_hours: number;
  budget: number;
  currency: string;
  job_date: string;
  job_time: string;
  location: string;
  status: string; // 'open', 'in_progress', 'completed', 'cancelled'
  is_collaboration: boolean;
  photographers_needed?: number;
  application_count?: number; // Total applications for this job
}

interface Application {
  id: string;
  jobId: string;
  photographerId: string;
  message: string;
  proposedRate: number;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  photographerFirstName: string;
  photographerLastName: string;
  photographerEmail: string;
  photographerAvatar?: string;
  photographerRating?: number;
  photographerReviews?: number;
}

export default function ClientJobManagementPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<{ [jobId: string]: Application[] }>({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);
  const [errorApplications, setErrorApplications] = useState<string | null>(null);
  const [updatingApplication, setUpdatingApplication] = useState<string | null>(null); // application ID being updated

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // New state for review modal
  const [selectedApplicationForReview, setSelectedApplicationForReview] = useState<Application | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedApplications, setReviewedApplications] = useState<Set<string>>(new Set()); // Track reviewed applications

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false); // NEW: State for job complete confirmation modal
  const [selectedJobForCompletion, setSelectedJobForCompletion] = useState<Job | null>(null); // NEW: Job selected for completion
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false); // NEW: Loading state for job completion


  // Fetch client's posted jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setErrorJobs(null);
      try {
        const response = await fetch("/api/jobs?userType=client");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data.jobs);
      } catch (e: any) {
        console.error("Failed to fetch client jobs:", e);
        setErrorJobs("Failed to load your posted jobs. Please try again.");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [isSubmittingCompletion]); // Re-fetch jobs after completing one

  // Fetch applications for each job
  useEffect(() => {
    const fetchApplicationsForJobs = async () => {
      if (jobs.length === 0) return;

      setLoadingApplications(true);
      setErrorApplications(null);
      const newApplications: { [jobId: string]: Application[] } = {};
      let hasError = false;

      for (const job of jobs) {
        try {
          const response = await fetch(`/api/job-applications?jobId=${job.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch applications for job ${job.id}: ${response.status}`);
          }
          const data = await response.json();
          newApplications[job.id] = data.applications.map((app: any) => ({
            ...app,
            appliedAt: new Date(app.appliedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          }));
        } catch (e: any) {
          console.error(`Error fetching applications for job ${job.id}:`, e);
          setErrorApplications("Failed to load some job applications.");
          hasError = true;
        }
      }
      setApplications(newApplications);
      if (hasError) setErrorApplications("Failed to load all job applications.");
      setLoadingApplications(false);
    };

    if (jobs.length > 0) {
      fetchApplicationsForJobs();
    }
  }, [jobs]);

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    setUpdatingApplication(applicationId);
    try {
      const response = await fetch(`/api/job-applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Application Status Updated",
          description: `Application ${applicationId.substring(0, 8)}... is now ${newStatus}.`,
          variant: "default",
        });
        setApplications(prev => {
          const newApps = { ...prev };
          for (const jobId in newApps) {
            newApps[jobId] = newApps[jobId].map(app =>
              app.id === applicationId ? { ...app, status: newStatus } : app
            );
          }
          return newApps;
        });
        // Optionally update job status to 'in_progress' if an application is accepted
        // This would require another API call (e.g., PUT /api/jobs/[jobId]/status)
      } else {
        toast({
          title: "Failed to Update Status",
          description: data.error || "There was an issue updating the application status.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      console.error("Error updating application status:", e);
      toast({
        title: "Network Error",
        description: "Could not update application status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingApplication(null);
    }
  };

  const handleOpenReviewModal = (application: Application) => {
    setSelectedApplicationForReview(application);
    setReviewRating(0); // Reset rating
    setReviewComment(""); // Reset comment
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplicationForReview || reviewRating === 0) {
      toast({
        title: "Review Error",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedApplicationForReview.jobId,
          photographerId: selectedApplicationForReview.photographerId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Review Submitted!",
          description: data.message,
          variant: "default",
        });
        setReviewedApplications(prev => new Set(prev).add(selectedApplicationForReview.id));
        setIsReviewModalOpen(false);
        setSelectedApplicationForReview(null);
      } else {
        toast({
          title: "Review Submission Failed",
          description: data.error || "There was an issue submitting your review.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Network Error",
        description: "Could not submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMarkAsCompleteClick = (job: Job) => { // NEW: Function to open confirmation modal
    setSelectedJobForCompletion(job);
    setIsCompleteModalOpen(true);
  };

  const handleSubmitCompleteJob = async () => { // NEW: Function to submit job completion
    if (!selectedJobForCompletion) return;

    setIsSubmittingCompletion(true);
    try {
      // Find the accepted application for this job to get the photographer ID
      const acceptedApp = applications[selectedJobForCompletion.id]?.find(app => app.status === 'accepted');
      if (!acceptedApp) {
        toast({
          title: "Cannot Complete Job",
          description: "No accepted application found for this job, or job already completed.",
          variant: "destructive",
        });
        setIsSubmittingCompletion(false);
        setIsCompleteModalOpen(false);
        return;
      }

      const response = await fetch("/api/jobs", { // Using the updated /api/jobs PUT endpoint
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobForCompletion.id,
          newStatus: "completed",
          photographerId: acceptedApp.photographerId, // Pass photographer ID for notification
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Job Completed!",
          description: data.message,
          variant: "default",
        });
        // Update local jobs state
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === selectedJobForCompletion.id ? { ...job, status: "completed" } : job
          )
        );
        setIsCompleteModalOpen(false);
        setSelectedJobForCompletion(null);
      } else {
        toast({
          title: "Job Completion Failed",
          description: data.error || "There was an issue marking the job as complete.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error marking job as complete:", error);
      toast({
        title: "Network Error",
        description: "Could not mark job as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCompletion(false);
    }
  };


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => setReviewRating(i + 1)}
      />
    ));
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
                  My Posted Jobs
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
                  <Button className="refined-button-secondary font-light">Post New Job</Button>
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
          <h1 className="text-3xl font-light text-slate-800 dark:text-white mb-8">Manage Your Jobs & Applications</h1>

          {loadingJobs && <p className="text-center text-gray-500">Loading your jobs...</p>}
          {errorJobs && <p className="text-center text-red-500">{errorJobs}</p>}

          {!loadingJobs && jobs.length === 0 && (
            <div className="text-center p-8 border rounded-lg bg-white/50 backdrop-blur-sm">
              <p className="text-lg text-gray-600 mb-4">You haven't posted any jobs yet.</p>
              <Link href="/client/post-job">
                <Button className="bg-blue-600 hover:bg-blue-700">Post Your First Job</Button>
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {jobs.map((job) => (
              <Card key={job.id} className="refined-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-light">{job.title}</CardTitle>
                      <CardDescription className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" /> {job.location}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${
                        job.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                      {job.status.replace(/_/g, ' ').charAt(0).toUpperCase() + job.status.replace(/_/g, ' ').slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <DollarSign className="h-4 w-4 mr-1" /> Budget: ${job.budget.toLocaleString()} {job.currency}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="h-4 w-4 mr-1" /> Duration: {job.duration_hours} hours
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="h-4 w-4 mr-1" /> Applications: {applications[job.id]?.length || 0}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-4">{job.description}</p>

                  <h3 className="text-lg font-semibold mb-3">
                    Applications for "{job.title}" ({applications[job.id]?.length || 0})
                  </h3>

                  {loadingApplications && <p className="text-center text-gray-500">Loading applications...</p>}
                  {errorApplications && <p className="text-center text-red-500">{errorApplications}</p>}
                  {!loadingApplications && (!applications[job.id] || applications[job.id].length === 0) && (
                    <p className="text-center text-gray-500 text-sm">No applications received yet for this job.</p>
                  )}

                  <div className="space-y-4">
                    {applications[job.id]?.map((app) => (
                      <Card key={app.id} className="border border-slate-200/50 dark:border-slate-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={app.photographerAvatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {app.photographerFirstName[0]}{app.photographerLastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link href={`/client/photographer/${app.photographerId}`} className="font-medium text-slate-800 dark:text-white hover:underline">
                                  {app.photographerFirstName} {app.photographerLastName}
                                </Link>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                                  <span>{app.photographerRating?.toFixed(1) || 'N/A'} ({app.photographerReviews || 0})</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className={`text-xs ${
                                app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-700 mb-3">
                            <p className="mb-1">
                              Proposed Rate: **${app.proposedRate?.toLocaleString() || 'N/A'} {job.currency}**
                            </p>
                            {app.message && (
                              <p className="bg-gray-50 p-2 rounded-md text-gray-600 italic">
                                "{app.message}"
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-3">Applied on: {app.appliedAt}</p>

                          <div className="flex space-x-2">
                            {job.status === 'open' && app.status === 'pending' && ( // Only show accept/reject if job is open and app is pending
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                  disabled={updatingApplication === app.id}
                                >
                                  {updatingApplication === app.id ? "Accepting..." : "Accept"}
                                  <CheckCircle className="ml-1 h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                  disabled={updatingApplication === app.id}
                                >
                                  {updatingApplication === app.id ? "Rejecting..." : "Reject"}
                                  <XCircle className="ml-1 h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {job.status === 'in_progress' && app.status === 'accepted' && !reviewedApplications.has(app.id) && ( // Show complete & review if in progress
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-purple-600 text-white hover:bg-purple-700" // New color for complete
                                    onClick={() => handleMarkAsCompleteClick(job)} // NEW: Mark as Complete button
                                    disabled={isSubmittingCompletion}
                                >
                                    Mark as Complete <CheckCircle className="ml-1 h-4 w-4" />
                                </Button>
                            )}
                            {job.status === 'completed' && app.status === 'accepted' && !reviewedApplications.has(app.id) && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    onClick={() => handleOpenReviewModal(app)}
                                >
                                    <Star className="mr-1 h-4 w-4" /> Leave Review
                                </Button>
                            )}
                            {app.status === 'accepted' && reviewedApplications.has(app.id) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="text-gray-500"
                                >
                                    Review Submitted <CheckCircle className="ml-1 h-4 w-4" />
                                </Button>
                            )}
                            <Link href={`/messages?contact=${app.photographerId}`}>
                                <Button size="sm" variant="ghost">
                                    <MessageCircle className="mr-1 h-4 w-4" /> Message
                                </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Review Submission Modal (Existing) */}
      {selectedApplicationForReview && (
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Review {selectedApplicationForReview.photographerFirstName} {selectedApplicationForReview.photographerLastName}</DialogTitle>
              <DialogDescription>
                Share your experience for job "{jobs.find(j => j.id === selectedApplicationForReview.jobId)?.title}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-lg">Your Rating</Label>
                <div className="flex space-x-1">
                  {renderStars(reviewRating)}
                </div>
                {reviewRating === 0 && <p className="text-sm text-red-500">Please select a rating.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewComment">Comment</Label>
                <Textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your experience..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)} disabled={isSubmittingReview}>Cancel</Button>
              <Button onClick={handleSubmitReview} disabled={isSubmittingReview || reviewRating === 0}>
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                <Star className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* NEW: Job Completion Confirmation Modal */}
      {selectedJobForCompletion && (
        <AlertDialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Job as Complete?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark "<strong>{selectedJobForCompletion.title}</strong>" as complete? This action cannot be undone. This will also prompt the photographer to leave a review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmittingCompletion}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitCompleteJob} disabled={isSubmittingCompletion}>
                {isSubmittingCompletion ? "Completing..." : "Confirm Complete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}