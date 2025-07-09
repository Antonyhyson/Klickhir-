// app/register/page.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera, Users, ArrowLeft, Shield, Smartphone } from "lucide-react"
import Link from "next/link"
import { GlitterBackground } from "@/components/glitter-background"
import { QRCodeSVG } from 'qrcode.react' // Import QRCode component

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
]

const cameraKits = [
  "DSLR Camera Kit",
  "Mirrorless Camera Kit",
  "Professional Video Kit",
  "Drone Photography Kit",
  "Studio Lighting Kit",
  "Portrait Photography Kit",
  "Wedding Photography Kit",
  "Event Photography Kit",
  "Commercial Photography Kit",
  "Fashion Photography Kit",
]

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<string>("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
    cameraKit: [] as string[],
    mfaMethod: "authenticator", // Default to authenticator
  })
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [mfaSetupDetails, setMfaSetupDetails] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const type = searchParams.get("type")
    if (type) {
      setUserType(type)
    }
  }, [searchParams])

  const handleCameraKitChange = (kit: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        cameraKit: [...prev.cameraKit, kit],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        cameraKit: prev.cameraKit.filter((k) => k !== kit),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.location ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          userType,
          location: formData.location,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          mfaMethod: formData.mfaMethod,
          cameraKit: formData.cameraKit,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRegistrationSuccess(true)
        if (data.mfa && formData.mfaMethod === "authenticator") {
          setMfaSetupDetails(data.mfa)
        }
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Render role selection if userType is not set
  if (!userType) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <div className="relative z-10">
          <Card className="bg-white/95 backdrop-blur-sm w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Choose Your Role</CardTitle>
              <CardDescription>Select how you want to use ClickHire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full h-16 flex items-center justify-center space-x-3"
                onClick={() => setUserType("client")}
              >
                <Users className="h-6 w-6" />
                <span>Register as Client</span>
              </Button>
              <Button
                className="w-full h-16 flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700"
                onClick={() => setUserType("photographer")}
              >
                <Camera className="h-6 w-6" />
                <span>Register as Photographer</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render MFA setup or success message after successful registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <div className="relative z-10 p-4">
          <Card className="bg-white/95 backdrop-blur-sm w-full max-w-md text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
              <CardDescription>
                {formData.mfaMethod === "authenticator"
                  ? "Your account has been created. Please set up your Authenticator App for secure login."
                  : "Your account has been created. Please proceed to login."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.mfaMethod === "authenticator" && mfaSetupDetails && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Scan the QR code below with your Authenticator App (e.g., Google Authenticator, Authy), or manually enter the key.
                  </p>
                  <div className="flex justify-center p-4 bg-gray-100 rounded-md">
                    {mfaSetupDetails.otpauthUrl ? (
                      <QRCodeSVG value={mfaSetupDetails.otpauthUrl} size={200} level="H" />
                    ) : (
                      <p className="text-red-500">Error generating QR code.</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <Label className="text-sm font-medium">Your Secret Key:</Label>
                    <p className="text-lg font-bold text-gray-800 break-all">{mfaSetupDetails.secret}</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    After scanning, use the 6-digit code from your authenticator app to log in.
                  </p>
                </div>
              )}
              <Button onClick={() => window.location.href = "/login"} className="w-full">
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render registration form
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <GlitterBackground />
      <div className="relative z-10 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              {userType === "client" ? (
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              ) : (
                <Camera className="h-12 w-12 text-green-600 mx-auto mb-4" />
              )}
              <CardTitle className="text-2xl">
                Register as {userType === "client" ? "Client" : "Photographer"}
              </CardTitle>
              <CardDescription>Create your account to get started with ClickHire</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Camera Kit Selection for Photographers */}
                {userType === "photographer" && (
                  <div className="space-y-2">
                    <Label>Camera Kit & Equipment *</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {cameraKits.map((kit) => (
                        <div key={kit} className="flex items-center space-x-2">
                          <Checkbox
                            id={kit}
                            checked={formData.cameraKit.includes(kit)}
                            onCheckedChange={(checked) => handleCameraKitChange(kit, checked as boolean)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={kit} className="text-sm">
                            {kit}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* MFA Selection */}
                <div className="space-y-2">
                  <Label>Multi-Factor Authentication *</Label>
                  <div className="flex items-center space-x-4 p-4 border rounded-md bg-yellow-50">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Security Required</p>
                      <p className="text-xs text-gray-600">MFA is mandatory for all accounts</p>
                    </div>
                  </div>
                  <Select
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, mfaMethod: value }))}
                    defaultValue="authenticator"
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose MFA method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authenticator">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Authenticator App (Recommended)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>SMS Notifications (Demo)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}