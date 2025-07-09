import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, userType, location, password, confirmPassword, mfaMethod, cameraKit } =
      body

    console.log("Registration attempt:", { email, userType, location })

    // Validation
    if (!firstName || !lastName || !email || !phone || !userType || !location || !password) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!["client", "photographer"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // For demo purposes, just return success
    // In a real app, this would create the user in the database
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          userType,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Registration failed. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
