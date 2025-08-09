"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Users, CheckCircle } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { useToast } from "@/hooks/use-toast"
import { useSession, signOut } from "next-auth/react"

export default function SelectRolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    isOAuth: false,
  })

  useEffect(() => {
    // Get user info from URL params (OAuth flow) or session
    const email = searchParams.get("email") || session?.user?.email || ""
    const firstName = searchParams.get("firstName") || session?.user?.name?.split(" ")[0] || ""
    const lastName = searchParams.get("lastName") || session?.user?.name?.split(" ").slice(1).join(" ") || ""
    const isOAuth = searchParams.get("oauth") === "true" || !!session

    setUserInfo({ email, firstName, lastName, isOAuth })

    if (!email) {
      // No user info available, redirect to login
      router.push("/login")
    }
  }, [searchParams, session, router])

  const handleRoleSelection = async (userType: "client" | "photographer") => {
    setIsLoading(true)

    try {
      // For OAuth users, we need to create them in your system
      if (userInfo.isOAuth) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            phone: "", // OAuth users might not have phone initially
            location: "US", // Default location
            password: "", // OAuth users don't have passwords
            confirmPassword: "",
            mfaMethod: "none", // OAuth users skip MFA for now
            userType: userType,
            isOAuthUser: true,
          }),
        })

        if (response.ok) {
          // Success - redirect to appropriate dashboard
          if (userType === "client") {
            router.push("/client/dashboard")
          } else {
            router.push("/photographer/dashboard")
          }
          return
        }
      }

      // For existing users, update their role
      const response = await fetch("/api/auth/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          userType: userType,
        }),
      })

      if (response.ok) {
        if (userType === "client") {
          router.push("/client/dashboard")
        } else {
          router.push("/photographer/dashboard")
        }
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to set user role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Role selection error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (userInfo.isOAuth) {
      await signOut({ callbackUrl: "/" })
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <GlitterBackground />
      <div className="relative z-10 p-4">
        <Card className="bg-white/95 backdrop-blur-sm w-full max-w-2xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Welcome to Klickhiré!</CardTitle>
            <CardDescription>
              {userInfo.firstName && `Hi ${userInfo.firstName}! `}
              What would you like to do on our platform?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                className="h-24 flex-col justify-center space-y-2"
                onClick={() => handleRoleSelection("client")}
                disabled={isLoading}
              >
                <Users className="h-8 w-8" />
                <span>Hire a Photographer</span>
                <span className="text-xs opacity-75">Find and book professional photographers</span>
              </Button>
              <Button
                className="h-24 flex-col justify-center space-y-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleRoleSelection("photographer")}
                disabled={isLoading}
              >
                <Camera className="h-8 w-8" />
                <span>Find Photography Gigs</span>
                <span className="text-xs opacity-75">Offer your photography services</span>
              </Button>
            </div>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out and try a different account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
