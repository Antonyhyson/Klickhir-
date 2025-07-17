// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e8462bf95362a5017ca47ad2e1248/app/reset-password/[token]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LockReset } from "lucide-react" // Assuming LockReset is available or use another appropriate icon
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const params = useParams()
  const token = params.token as string

  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing password reset token.")
      setIsError(true)
      toast({
        title: "Error",
        description: "Invalid or missing password reset token.",
        variant: "destructive",
      })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setIsError(false)
    setIsSuccess(false)

    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.")
      setIsError(true)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long.")
      setIsError(true)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword, confirmNewPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setIsSuccess(true)
        toast({
          title: "Password Reset Successful",
          description: data.message,
          variant: "default",
        })
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login"
        }, 3000)
      } else {
        setMessage(data.error || "Failed to reset password.")
        setIsError(true)
        toast({
          title: "Password Reset Failed",
          description: data.error || "There was an issue resetting your password.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setMessage("Network error. Please try again.")
      setIsError(true)
      toast({
        title: "Network Error",
        description: "Could not reset password. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If token is missing or already processed (isSuccess)
  if (!token || isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <div className="relative z-10 w-full max-w-md text-center">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <h1 className="text-xl font-bold mb-4">
                {isSuccess ? "Password Reset Complete!" : "Invalid/Expired Link"}
              </h1>
              <p className="text-gray-600 mb-6">
                {isSuccess
                  ? "You will be redirected to the login page shortly."
                  : "The password reset link is invalid or has expired. Please request a new one."}
              </p>
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <GlitterBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            {/* Assuming LockReset icon is available, otherwise use a generic lock icon */}
            <LockReset className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <div className={`mb-4 p-3 rounded-md ${isError ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                <p className={`text-sm ${isError ? "text-red-600" : "text-green-600"}`}>{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}