import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, userType, cameraKit } = body

    if ((!userId && !email) || !userType) {
      return NextResponse.json({ error: "User ID/email and user type are required" }, { status: 400 })
    }

    // Find user by either ID or email
    let existingUser
    if (userId) {
      [existingUser] = await sql`
        SELECT id FROM users WHERE id = ${userId}
      `
    } else if (email) {
      [existingUser] = await sql`
        SELECT id FROM users WHERE email = ${email}
      `
    }
    
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const finalUserId = existingUser.id

    // Update the user with the selected role
    await sql`
      UPDATE users
      SET user_type = ${userType}
      WHERE id = ${finalUserId}
    `

    // Create the appropriate profile based on the selected role
    if (userType === "photographer") {
      const photographerCameraKit = Array.isArray(cameraKit) ? cameraKit : []
      await sql`
        INSERT INTO photographer_profiles (
          user_id, specialties, camera_equipment
        ) VALUES (
          ${finalUserId}, ARRAY[]::TEXT[], ${photographerCameraKit}
        )
      `
    } else if (userType === "client") {
      await sql`
        INSERT INTO client_profiles (
          user_id
        ) VALUES (
          ${finalUserId}
        )
      `
    }

    return NextResponse.json(
      {
        message: "User role and profile created successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Select role API error:", error)
    return NextResponse.json(
      {
        error: "Failed to set user role. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}