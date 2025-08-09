import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login?error=no_session", req.url))
    }

    // Check if user exists in your system or create them
    const userEmail = session.user.email
    const userName = session.user.name || ""
    const [firstName, ...lastNameParts] = userName.split(" ")
    const lastName = lastNameParts.join(" ") || ""

    // For now, redirect to role selection since this is a new OAuth user
    // In a real app, you'd check your database here
    const callbackUrl = new URL("/select-role", req.url)
    callbackUrl.searchParams.set("email", userEmail)
    callbackUrl.searchParams.set("firstName", firstName || "")
    callbackUrl.searchParams.set("lastName", lastName || "")
    callbackUrl.searchParams.set("oauth", "true")

    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_error", req.url))
  }
}
