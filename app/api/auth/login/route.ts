import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple mock authentication for demo
const mockUsers = {
  "sarah.johnson@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "sarah.johnson@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    userType: "photographer",
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "michael.chen@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "michael.chen@example.com",
    firstName: "Michael",
    lastName: "Chen",
    userType: "photographer",
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "emma.rodriguez@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "emma.rodriguez@example.com",
    firstName: "Emma",
    lastName: "Rodriguez",
    userType: "photographer",
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "david.kim@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "david.kim@example.com",
    firstName: "David",
    lastName: "Kim",
    userType: "photographer",
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "john.client@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "john.client@example.com",
    firstName: "John",
    lastName: "Client",
    userType: "client",
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
}

function generateSimpleToken(user: any): string {
  const tokenData = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType, mfaCode } = body

    console.log("Login attempt:", { email, userType, hasMfaCode: !!mfaCode })

    // Validation
    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Email, password, and user type are required" }, { status: 400 })
    }

    // Check if user exists in mock data
    const user = mockUsers[email as keyof typeof mockUsers]

    if (!user || password !== "password123") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user type matches
    if (user.userType !== userType) {
      return NextResponse.json({ error: "Invalid user type for this account" }, { status: 401 })
    }

    // Handle MFA
    if (!mfaCode) {
      // First step - credentials verified, now require MFA
      return NextResponse.json({
        message: "Credentials verified",
        requiresMFA: true,
      })
    }

    // Second step - verify MFA code
    // In demo mode, accept any 6-digit code
    if (mfaCode.length !== 6 || !/^\d{6}$/.test(mfaCode)) {
      return NextResponse.json({ error: "Invalid MFA code format. Please enter 6 digits." }, { status: 401 })
    }

    // Generate token
    const token = generateSimpleToken(user)

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
      requiresMFA: false,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
