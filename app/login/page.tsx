"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Users, ArrowLeft, Shield } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaCode: "",
  })
  const [showMFA, setShowMFA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserType, setCurrentUserType] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent, userType: string) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setCurrentUserType(userType)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: userType,
          mfaCode: showMFA ? formData.mfaCode : null,
        }),
      })

      const responseText = await response.text()
      console.log("Response status:", response.status)
      console.log("Response text:", responseText)

      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Server error (${response.status})`
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        setError("Invalid server response")
        setIsLoading(false)
        return
      }

      if (data.requiresMFA && !showMFA) {
        setShowMFA(true)
        setIsLoading(false)
      } else {
        // Login successful
        if (userType === "client") {
          window.location.href = "/client/dashboard"
        } else {
          window.location.href = "/photographer/dashboard"
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setShowMFA(false)
    setFormData({ email: "", password: "", mfaCode: "" })
    setCurrentUserType("")
    setError("")
  }

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />
      <div className="relative z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your ClickHire account</CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!showMFA ? (
                <Tabs defaultValue="client" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="client" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Client</span>
                    </TabsTrigger>
                    <TabsTrigger value="photographer" className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Photographer</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="client">
                    <form onSubmit={(e) => handleSubmit(e, "client")} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-email">Email</Label>
                        <Input
                          id="client-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-password">Password</Label>
                        <Input
                          id="client-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Continue"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="photographer">
                    <form onSubmit={(e) => handleSubmit(e, "photographer")} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="photographer-email">Email</Label>
                        <Input
                          id="photographer-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="photographer-password">Password</Label>
                        <Input
                          id="photographer-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Continue"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-md">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Multi-Factor Authentication</p>
                      <p className="text-xs text-gray-600">Enter any 6-digit code (demo mode)</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSubmit(e, currentUserType)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mfa-code">Authentication Code</Label>
                      <Input
                        id="mfa-code"
                        value={formData.mfaCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, mfaCode: e.target.value }))}
                        placeholder="Enter 6-digit code (e.g., 123456)"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={`flex-1 ${
                          currentUserType === "photographer" ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify & Sign In"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Sign up here
                </Link>
              </div>

              {/* Demo credentials helper */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">📧 sarah.johnson@example.com (Photographer)</p>
                  <p className="text-xs text-gray-600">📧 john.client@example.com (Client)</p>
                  <p className="text-xs text-gray-600">🔑 Password: password123</p>
                  <p className="text-xs text-gray-600">🔐 MFA: Any 6-digit code (e.g., 123456)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
