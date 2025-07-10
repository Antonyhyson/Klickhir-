// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MailCheck } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        toast({
          title: "Password Reset Requested",
          description: data.message,
          variant: "default",
        })
      } else {
        setMessage(data.error || "Failed to request password reset.")
        setIsError(true)
        toast({
          title: "Password Reset Failed",
          description: data.error || "There was an issue requesting your password reset.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Forgot password request error:", err)
      setMessage("Network error. Please try again.")
      setIsError(true)
      toast({
        title: "Network Error",
        description: "Could not request password reset. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <GlitterBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <MailCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
            <CardDescription>
              Enter your email address below and we'll send you a link to reset your password.
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}