"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Camera, MapPin, Clock, DollarSign } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"

const photographyTypes = [
  "Wedding Photography",
  "Portrait Photography",
  "Event Photography",
  "Corporate Photography",
  "Product Photography",
  "Fashion Photography",
  "Real Estate Photography",
  "Food Photography",
  "Travel Photography",
  "Street Photography",
  "Documentary Photography",
  "Commercial Photography",
]

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photographyType: "",
    hours: "",
    budget: "",
    date: "",
    time: "",
    location: "",
    transportationFee: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Job posted:", formData)
    // Redirect back to dashboard
    window.location.href = "/client/dashboard"
  }

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-2">
              <Link href="/client/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Post a Photography Job</CardTitle>
              <CardDescription>Find the perfect photographer for your project</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Wedding Photography at Central Park"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your photography needs, style preferences, and any specific requirements..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photographyType">Type of Photography *</Label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, photographyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select photography type" />
                    </SelectTrigger>
                    <SelectContent>
                      {photographyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Duration (Hours) *</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={formData.hours}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hours: e.target.value }))}
                      placeholder="e.g., 4"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USD) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                      placeholder="e.g., 500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Central Park, New York, NY"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transportationFee"
                    checked={formData.transportationFee}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, transportationFee: checked as boolean }))
                    }
                  />
                  <Label htmlFor="transportationFee" className="text-sm">
                    Include transportation fee for photographer
                  </Label>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Job Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Budget: ${formData.budget || "0"} USD</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {formData.hours || "0"} hours</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Location: {formData.location || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Post Job
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
