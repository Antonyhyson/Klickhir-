// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/photographer/post-work/page.tsx
"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, Upload, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react" // Added CheckCircle, XCircle
import { GlitterBackground } from "@/components/glitter-background"

export default function PostWorkPage() {
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    location: "",
    date: "",
    images: [] as File[], // Stores actual File objects
  })
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0) // For a real progress indicator
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle")
  const [submissionMessage, setSubmissionMessage] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmissionStatus("idle")
    setSubmissionMessage("")

    if (!formData.projectName || formData.images.length === 0) {
      setSubmissionStatus("error")
      setSubmissionMessage("Project name and at least one image are required.")
      setIsLoading(false)
      return
    }

    try {
      const uploadedImageUrls: string[] = []
      // 1. Upload images first
      for (const file of formData.images) {
        const imageFormData = new FormData()
        imageFormData.append('files', file) // 'files' must match the key expected by backend /api/upload/image

        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: imageFormData,
          // No 'Content-Type' header needed for FormData; browser sets it automatically
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${file.name}, Status: ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()
        if (uploadData.urls && uploadData.urls.length > 0) {
          uploadedImageUrls.push(...uploadData.urls)
        } else {
          throw new Error(`Upload failed for ${file.name}: No URL returned.`)
        }
      }

      // 2. Submit portfolio post with uploaded image URLs
      const postResponse = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: formData.projectName,
          description: formData.description,
          location: formData.location,
          date: formData.date || null, // Allow null if date is optional
          images: uploadedImageUrls, // Send collected URLs
        }),
      })

      const postData = await postResponse.json()

      if (postResponse.ok) {
        setSubmissionStatus("success")
        setSubmissionMessage("Your work has been successfully shared!")
        // Clear form after successful submission
        setFormData({
          projectName: "",
          description: "",
          location: "",
          date: "",
          images: [],
        })
        // Optionally redirect after a short delay
        setTimeout(() => {
          window.location.href = "/photographer/portfolio"
        }, 2000)
      } else {
        throw new Error(postData.error || "Failed to share work.")
      }
    } catch (error: any) {
      console.error("Error during submission:", error)
      setSubmissionStatus("error")
      setSubmissionMessage(error.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
      setUploadProgress(0) // Reset progress
    }
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

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Share Your Work</CardTitle>
              <CardDescription>Showcase your photography to potential clients</CardDescription>
            </CardHeader>

            <CardContent>
              {submissionStatus === "success" && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-700">{submissionMessage}</p>
                </div>
              )}
              {submissionStatus === "error" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">{submissionMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectName: e.target.value }))}
                    placeholder="e.g., Sarah & Mike's Wedding"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell the story behind this project..."
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Central Park, NY"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Upload Photos *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Drag and drop your photos here, or click to browse</p>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        required // HTML required attribute, though JS validation is primary
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("images")?.click()}
                        disabled={isLoading}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{formData.images.length} file(s) selected</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.images.map((file, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                            {file.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 text-green-800 hover:bg-green-200"
                              onClick={() => handleRemoveImage(index)}
                              disabled={isLoading}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Post Preview</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      <span>Project: {formData.projectName || "Untitled"}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Location: {formData.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Date: {formData.date || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Sharing Work..." : "Share Work"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}