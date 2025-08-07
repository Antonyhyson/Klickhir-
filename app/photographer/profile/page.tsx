// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/photographer/profile/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star, MapPin, Share, Phone, MessageCircle, Bookmark, MoreHorizontal, CheckCircle, XCircle, Heart } from "lucide-react" // Added Heart for posts
import { GlitterBackground } from "@/components/glitter-background"
import { Badge } from "@/components/ui/badge" // Import Badge
import { InstagramSync } from "@/components/photographer/instagram-sync" // NEW: Import the new component

// Removed mock workPosts
// const workPosts = [...]

// Define interfaces for fetched data
interface PhotographerProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  rating: number;
  reviews: number;
  connections: number;
  projects: number;
  posts: number; // Actual count from DB
  avatar: string;
  specialties: string[];
  camera_equipment: string[];
  hourlyRate: number;
  availability_status: string;
  currency: string;
  is_verified?: boolean;
}

interface PortfolioPost {
  id: string;
  project_name: string;
  description: string;
  location: string;
  project_date: string; // Maps to project_date
  images: string[];
  likes?: number;
  comments?: number;
  shares?: number;
}


interface EditableProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  locationCountry: string;
  bio: string;
  specialties: string[];
  cameraEquipment: string[];
  hourlyRate: number | string;
  availabilityStatus: string;
  profileImageUrl: string;
}


export default function PhotographerProfile() {
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null)
  const [profilePosts, setProfilePosts] = useState<PortfolioPost[]>([]) // New state for posts
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // For profile data
  const [loadingPosts, setLoadingPosts] = useState(true) // New loading state for posts
  const [error, setError] = useState<string | null>(null) // For profile data error
  const [postsError, setPostsError] = useState<string | null>(null) // New error state for posts

  const [isEditing, setIsEditing] = useState(false)
  const [editableFormData, setEditableFormData] = useState<EditableProfileFormData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const photographyTypes = [
    "Wedding Photography", "Portrait Photography", "Event Photography",
    "Corporate Photography", "Product Photography", "Fashion Photography",
    "Real Estate Photography", "Food Photography", "Travel Photography",
    "Street Photography", "Documentary Photography", "Commercial Photography",
  ];

  const cameraKits = [
    "DSLR Camera Kit", "Mirrorless Camera Kit", "Professional Video Kit",
    "Drone Photography Kit", "Studio Lighting Kit", "Portrait Photography Kit",
    "Wedding Photography Kit", "Event Photography Kit", "Commercial Photography Kit",
    "Fashion Photography Kit",
  ];

  const countries = [
    { code: "US", name: "United States", currency: "USD" },
    { code: "GB", name: "United Kingdom", currency: "GBP" },
    { code: "CA", name: "Canada", currency: "CAD" },
    { code: "AU", name: "Australia", currency: "AUD" },
    { code: "DE", name: "Germany", currency: "EUR" },
    { code: "FR", name: "France", currency: "EUR" },
    { code: "JP", name: "Japan", currency: "JPY" },
    { code: "IN", name: "India", currency: "INR" },
    { code: "BR", name: "Brazil", currency: "BRL" },
    { code: "MX", name: "Mexico", currency: "MXN" },
  ];


  // Fetch photographer profile data and posts
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const fetchedPhotographer: PhotographerProfile = {
            ...data.user,
            name: `${data.user.first_name} ${data.user.last_name}`,
            username: `${data.user.first_name.toLowerCase()}_${data.user.last_name.toLowerCase()}_photo`,
            location: data.user.location_country,
            reviews: data.user.total_reviews,
            hourlyRate: data.user.hourly_rate,
            availability_status: data.user.availability_status,
            avatar: data.user.profile_image_url || "/placeholder.svg?height=128&width=128",
            specialties: data.user.specialties || [],
            camera_equipment: data.user.camera_equipment || [],
            posts: data.user.posts || 0,
            connections: data.user.connections || 0,
            projects: data.user.projects || 0,
            currency: data.user.currency || "USD",
        };
        setPhotographer(fetchedPhotographer)
        setEditableFormData({
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          phone: data.user.phone,
          locationCountry: data.user.location_country,
          bio: data.user.bio || "",
          specialties: data.user.specialties || [],
          cameraEquipment: data.user.camera_equipment || [],
          hourlyRate: data.user.hourly_rate || "",
          availabilityStatus: data.user.availability_status || "available",
          profileImageUrl: data.user.profile_image_url || "",
        })
      } catch (e: any) {
        console.error("Failed to fetch photographer profile:", e)
        setError("Failed to load profile. Please ensure you are logged in as a photographer.")
      } finally {
        setLoading(false)
      }
    }

    const fetchPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      try {
        const response = await fetch("/api/portfolio"); // Fetch posts for authenticated user
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const data = await response.json();
        const fetchedPosts: PortfolioPost[] = data.posts.map((post: any) => ({
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
        setProfilePosts(fetchedPosts);
      } catch (e: any) {
        console.error("Error fetching portfolio posts:", e);
        setPostsError("Failed to load portfolio posts.");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfileData();
    fetchPosts();
  }, [])


  const handleShare = (postId: string) => {
    if (photographer) {
      navigator.clipboard.writeText(`${window.location.origin}/photographer/portfolio/${photographer.id}?post=${postId}`) // Use consistent portfolio path
      alert("Link copied to clipboard!")
    } else {
      alert("Profile not loaded yet. Cannot share.")
    }
  }

  const handleContact = () => {
    // In a real app, this would open contact modal or redirect to messaging
    alert("Contact feature would open messaging interface")
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setSaveMessage(null)
    setSaveStatus("idle")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSaveMessage(null)
    setSaveStatus("idle")
    if (photographer) {
        setEditableFormData({
            firstName: photographer.name.split(' ')[0],
            lastName: photographer.name.split(' ')[1] || '',
            phone: photographer.phone,
            locationCountry: photographer.location,
            bio: photographer.bio || "",
            specialties: photographer.specialties || [],
            cameraEquipment: photographer.camera_equipment || [],
            hourlyRate: photographer.hourlyRate,
            availabilityStatus: photographer.availability_status,
            profileImageUrl: photographer.avatar || "",
        });
    }
  }

  const handleSave = async () => {
    if (!editableFormData) return;

    setIsSaving(true);
    setSaveMessage(null);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editableFormData.firstName,
          lastName: editableFormData.lastName,
          phone: editableFormData.phone,
          locationCountry: editableFormData.locationCountry,
          bio: editableFormData.bio,
          specialties: editableFormData.specialties,
          cameraEquipment: editableFormData.cameraEquipment,
          hourlyRate: Number(editableFormData.hourlyRate),
          availabilityStatus: editableFormData.availabilityStatus,
          profileImageUrl: editableFormData.profileImageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveStatus("success");
        setSaveMessage("Profile updated successfully!");
        setIsEditing(false);
        setPhotographer((prev) => prev ? ({
            ...prev,
            name: `${editableFormData.firstName} ${editableFormData.lastName}`,
            username: `${editableFormData.firstName.toLowerCase()}_${editableFormData.lastName.toLowerCase()}_photo`,
            phone: editableFormData.phone,
            location: editableFormData.locationCountry,
            bio: editableFormData.bio,
            specialties: editableFormData.specialties,
            camera_equipment: editableFormData.cameraEquipment,
            hourlyRate: Number(editableFormData.hourlyRate),
            availability_status: editableFormData.availabilityStatus,
            avatar: editableFormData.profileImageUrl,
        }) : null);

      } else {
        setSaveStatus("error");
        setSaveMessage(data.error || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setSaveStatus("error");
      setSaveMessage(err.message || "An unexpected error occurred during save.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  };


  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (!editableFormData) return;
    if (checked) {
      setEditableFormData((prev) => ({
        ...prev!,
        specialties: [...prev!.specialties, specialty],
      }))
    } else {
      setEditableFormData((prev) => ({
        ...prev!,
        specialties: prev!.specialties.filter((s) => s !== specialty),
      }))
    }
  }

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (!editableFormData) return;
    if (checked) {
      setEditableFormData((prev) => ({
        ...prev!,
        cameraEquipment: [...prev!.cameraEquipment, equipment],
      }))
    } else {
      setEditableFormData((prev) => ({
        ...prev!,
        cameraEquipment: prev!.cameraEquipment.filter((e) => e !== equipment),
      }))
    }
  }

  // Handler for photos selected from InstagramSync component
  const handleInstagramPhotosSelect = (photos: { url: string }[]) => {
    // Add the selected Instagram photo URLs to the portfolio's images
    setProfilePosts((prevPosts) => [
        ...prevPosts,
        ...photos.map(photo => ({
            id: `ig_${photo.url}`, // Create a unique ID for the post
            project_name: "Instagram Post",
            description: photo.caption || "",
            location: photographer?.location || "",
            project_date: new Date().toISOString(),
            images: [photo.url],
            likes: 0,
            comments: 0,
            shares: 0,
        }))
    ]);
  };


  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Loading profile...</p>
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

  if (!photographer || !editableFormData) {
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

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {saveStatus !== "idle" && (
            <div className={`mb-4 p-3 rounded-md flex items-center space-x-2 ${
              saveStatus === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              {saveStatus === "success" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
              <p className={`text-sm ${saveStatus === "success" ? "text-green-700" : "text-red-700"}`}>{saveMessage}</p>
            </div>
          )}

          {/* Instagram-style Profile Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={photographer.avatar || "/placeholder.svg?height=128&width=128"} />
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{photographer.username}</h1>
                    {isEditing ? (
                      <div className="flex space-x-2 mt-1">
                        <Input
                          value={editableFormData.firstName}
                          onChange={(e) => setEditableFormData(prev => ({ ...prev!, firstName: e.target.value }))}
                          placeholder="First Name"
                          className="w-auto"
                        />
                        <Input
                          value={editableFormData.lastName}
                          onChange={(e) => setEditableFormData(prev => ({ ...prev!, lastName: e.target.value }))}
                          placeholder="Last Name"
                          className="w-auto"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-600">{photographer.name}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!isEditing && (
                      <>
                        <Link href="/photographer/post-work">
                          <Button className="bg-green-600 hover:bg-green-700">Share New Work</Button>
                        </Link>
                        <Button variant="outline" onClick={handleEditClick}>
                          Edit Profile
                        </Button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
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

                {/* Bio and Stats */}
                <div className="space-y-2">
                  <p className="font-semibold">Wedding & Portrait Photographer</p>
                  {isEditing ? (
                    <>
                      <Label htmlFor="location-country">Location</Label>
                      <Select
                        value={editableFormData.locationCountry}
                        onValueChange={(value) => setEditableFormData(prev => ({ ...prev!, locationCountry: value }))}
                        disabled={isSaving}
                      >
                        <SelectTrigger id="location-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editableFormData.bio}
                        onChange={(e) => setEditableFormData(prev => ({ ...prev!, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        disabled={isSaving}
                      />
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editableFormData.phone}
                        onChange={(e) => setEditableFormData(prev => ({ ...prev!, phone: e.target.value }))}
                        disabled={isSaving}
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700">📍 {photographer.location}</p>
                      <p className="text-gray-700">✨ {photographer.bio}</p>
                      <p className="text-gray-700">📧 {photographer.email}</p>
                    </>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{photographer.rating}</span>
                      <span className="text-gray-600">({photographer.reviews} reviews)</span>
                    </div>
                    {isEditing ? (
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                value={editableFormData.hourlyRate}
                                onChange={(e) => setEditableFormData(prev => ({ ...prev!, hourlyRate: e.target.value }))}
                                className="w-24"
                                disabled={isSaving}
                            />
                        </div>
                    ) : (
                        <div className="text-sm">
                            <span className="font-semibold">
                                ${photographer.hourlyRate} {photographer.currency}/hr
                            </span>
                        </div>
                    )}
                  </div>

                  {isEditing ? (
                    <>
                        <Label>Specialties</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                            {photographyTypes.map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`specialty-${type}`}
                                        checked={editableFormData.specialties.includes(type)}
                                        onChange={(e) => handleSpecialtyChange(type, e.target.checked)}
                                        disabled={isSaving}
                                    />
                                    <Label htmlFor={`specialty-${type}`} className="text-sm">
                                        {type}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <Label>Camera Equipment</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                            {cameraKits.map((kit) => (
                                <div key={kit} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`equipment-${kit}`}
                                        checked={editableFormData.cameraEquipment.includes(kit)}
                                        onChange={(e) => handleEquipmentChange(kit, e.target.checked)}
                                        disabled={isSaving}
                                    />
                                    <Label htmlFor={`equipment-${kit}`} className="text-sm">
                                        {kit}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <Label htmlFor="availability">Availability</Label>
                        <Select
                            value={editableFormData.availabilityStatus}
                            onValueChange={(value) => setEditableFormData(prev => ({ ...prev!, availabilityStatus: value }))}
                            disabled={isSaving}
                        >
                            <SelectTrigger id="availability">
                                <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">
                                    <span className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Available
                                    </span>
                                </SelectItem>
                                <SelectItem value="busy">
                                    <span className="flex items-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                    Busy
                                    </span>
                                </SelectItem>
                                <SelectItem value="unavailable">
                                    <span className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    Unavailable
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                  ) : (
                    <>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {photographer.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary" className="text-xs">
                                    {specialty}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {photographer.camera_equipment.map((equipment) => (
                                <Badge key={equipment} variant="secondary" className="text-xs">
                                    {equipment}
                                </Badge>
                            ))}
                        </div>
                         {/* Availability Setting */}
                        <div className="flex items-center space-x-4 mt-4">
                            <span className="text-sm font-medium">Availability:</span>
                            <Badge
                              variant="secondary"
                              className={
                                photographer.availability_status === "available" ? "bg-green-100 text-green-800" :
                                photographer.availability_status === "busy" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }
                            >
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                photographer.availability_status === "available" ? "bg-green-500" :
                                photographer.availability_status === "busy" ? "bg-yellow-500" :
                                "bg-red-500"
                              }`}></div>
                              {photographer.availability_status.charAt(0).toUpperCase() + photographer.availability_status.slice(1)}
                            </Badge>
                        </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* NEW: Instagram Sync Section for Editing */}
          {isEditing && (
              <div className="mb-8">
                  <InstagramSync
                    onPhotosSelect={handleInstagramPhotosSelect}
                    isSubmitting={isSaving}
                    portfolioImages={profilePosts.flatMap(post => post.images)}
                  />
              </div>
          )}

          {/* Instagram-style Feed (real posts now) */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold mb-4">My Portfolio Posts</h2>
            {loadingPosts && <p className="text-center text-gray-500">Loading posts...</p>}
            {postsError && <p className="text-center text-red-500">{postsError}</p>}
            {!loadingPosts && !postsError && profilePosts.length === 0 && (
              <p className="text-center text-gray-500">No portfolio posts found yet. Share your first work!</p>
            )}
            {!loadingPosts && !postsError && profilePosts.map((post) => (
              <Card key={post.id} className="bg-white/95 backdrop-blur-sm overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={photographer.avatar || "/placeholder.svg"} />
                      <AvatarFallback>SP</AvatarFallback>
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
                        <Heart className="h-6 w-6" />
                      </Button>
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

                  {/* Likes and Comments */}
                  <div className="space-y-1 mb-2">
                    {post.likes !== undefined && <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>}
                    <p className="text-sm">
                      <span className="font-semibold">{photographer.username}</span> {post.description}
                    </p>
                    {post.comments && post.comments > 0 && (
                      <button className="text-sm text-gray-600">View all {post.comments} comments</button>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 uppercase">
                      {post.project_date}
                    </p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" onClick={handleContact}>
                      <Phone className="h-3 w-3 mr-1" />
                      Contact Photographer
                    </Button>
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