"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Mail, Building, LockKeyhole } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { useToast } from "@/hooks/use-toast"
import { signIn, getSession } from "next-auth/react"

export default function LoginPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaCode: "",
  })
  const [showMFA, setShowMFA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mfaMethod, setMfaMethod] = useState<"authenticator" | "sms" | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          mfaCode: showMFA ? formData.mfaCode : undefined,
        }),
      })

      const responseText = await response.text()

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

      if (data.requiresMFA) {
        setShowMFA(true)
        setMfaMethod(data.mfaMethod)
        setIsLoading(false)
      } else {
        // Login successful
        if (data.user.userType === "client") {
          window.location.href = "/client/dashboard"
        } else if (data.user.userType === "photographer") {
          window.location.href = "/photographer/dashboard"
        } else {
          // New: Handle case where user is registered but has no role yet
          window.location.href = "/select-role"
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please try again.")
      setIsLoading(false)
    }
  }

  const handleRequestSmsCode = async () => {
    if (resendCooldown > 0) return

    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    try {
      const response = await fetch("/api/auth/request-sms-mfa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "SMS Code Sent",
          description: data.message,
        })
      } else {
        setError(data.error || "Failed to request SMS code.")
      }
    } catch (err) {
      console.error("Request SMS code error:", err)
      setError("Network error. Could not request SMS code.")
    }
  }

  const resetForm = () => {
    setShowMFA(false)
    setFormData({ email: "", password: "", mfaCode: "" })
    setError("")
    setMfaMethod(null)
    setResendCooldown(0)
  }

  const handleGoogleLogin = async () => {
    try {
      // Use NextAuth signIn with redirect
      await signIn("google", {
        callbackUrl: "/select-role?oauth=true",
      })
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        title: "Login Failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOAuthLogin = (provider: string) => {
    // For Microsoft and SSO, show a demo message
    toast({
      title: "Demo Mode",
      description: `${provider} login is not implemented in this demo. Please use Google or email/password login.`,
      variant: "default",
    })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <GlitterBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Klickhiré account</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!showMFA ? (
              <>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center space-x-2"
                    onClick={handleGoogleLogin}
                    type="button"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Sign in with Google</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center space-x-2"
                    onClick={() => handleOAuthLogin("Microsoft")}
                    type="button"
                  >
                    <Building className="h-5 w-5" />
                    <span>Sign in with Microsoft</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center space-x-2"
                    onClick={() => handleOAuthLogin("SSO")}
                    type="button"
                  >
                    <LockKeyhole className="h-5 w-5" />
                    <span>Sign in with SSO</span>
                  </Button>
                </div>
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative inline-block px-2 text-sm text-gray-500 bg-white dark:bg-card">
                    Or continue with email
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:underline block text-right"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Continue"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-md">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Multi-Factor Authentication</p>
                    <p className="text-xs text-gray-600">
                      {mfaMethod === "authenticator"
                        ? "Enter the 6-digit code from your authenticator app."
                        : "Enter the 6-digit code sent to your registered phone number."}
                    </p>
                  </div>
                </div>

                {mfaMethod === "sms" && (
                  <Button
                    type="button"
                    onClick={handleRequestSmsCode}
                    className="w-full"
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Request SMS Code"}
                  </Button>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1" disabled={isLoading}>
                      Back
                    </Button>
                    <Button type="submit" className={`flex-1`} disabled={isLoading}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}