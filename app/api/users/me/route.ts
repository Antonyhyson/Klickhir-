// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/users/me/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    let userProfile;

    if (decoded.userType === "photographer") {
      // Fetch photographer's detailed profile
      const [photographer] = await sql`
        SELECT
          u.id, u.email, u.first_name, u.last_name, u.phone, u.location_country, u.currency, u.is_verified,
          pp.bio, pp.specialties, pp.camera_equipment, pp.hourly_rate, pp.availability_status,
          pp.rating, pp.total_reviews, pp.profile_image_url
        FROM users u
        JOIN photographer_profiles pp ON u.id = pp.user_id
        WHERE u.id = ${decoded.userId}
      `
      if (!photographer) {
        return NextResponse.json({ error: "Photographer profile not found" }, { status: 404 })
      }

      // Fetch dynamic counts (posts)
      const [postCountResult] = await sql`SELECT COUNT(*) FROM portfolio_posts WHERE photographer_id = ${decoded.userId}`
      // Mock other stats for now as they require more complex DB schema/relations
      const connectionsCount = Math.floor(Math.random() * 3000);
      const projectsCount = Math.floor(Math.random() * 100);


      userProfile = {
        ...photographer,
        name: `${photographer.first_name} ${photographer.last_name}`,
        username: `${photographer.first_name.toLowerCase()}_${photographer.last_name.toLowerCase()}_photo`,
        location: photographer.location_country,
        reviews: photographer.total_reviews,
        avatar: photographer.profile_image_url || "/placeholder.svg?height=128&width=128",
        posts: postCountResult.count || 0,
        connections: connectionsCount,
        projects: projectsCount,
        followers: 0,
        following: 0,
      };

    } else if (decoded.userType === "client") {
      // Fetch client's profile (less detailed for now)
      const [client] = await sql`
        SELECT
          u.id, u.email, u.first_name, u.last_name, u.phone, u.location_country, u.currency, u.is_verified,
          cp.company_name, cp.profile_image_url
        FROM users u
        LEFT JOIN client_profiles cp ON u.id = cp.user_id
        WHERE u.id = ${decoded.userId}
      `
      if (!client) {
        return NextResponse.json({ error: "Client profile not found" }, { status: 404 })
      }
      userProfile = {
        ...client,
        name: `${client.first_name} ${client.last_name}`,
        location: client.location_country,
        avatar: client.profile_image_url || "/placeholder.svg?height=128&width=128",
      };
    } else {
      return NextResponse.json({ error: "Unsupported user type" }, { status: 400 })
    }

    return NextResponse.json({ user: userProfile })

  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/users/me - Update authenticated user's profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const userId = decoded.userId // Get user ID from token

    // Fields that can be updated for all user types (from 'users' table)
    const { firstName, lastName, phone, locationCountry, profileImageUrl } = body;

    // Build update queries dynamically
    let userUpdateClauses: string[] = [];
    let userUpdateValues: any[] = [];

    if (firstName !== undefined) { userUpdateClauses.push(`first_name = $${userUpdateValues.length + 1}`); userUpdateValues.push(firstName); }
    if (lastName !== undefined) { userUpdateClauses.push(`last_name = $${userUpdateValues.length + 1}`); userUpdateValues.push(lastName); }
    if (phone !== undefined) { userUpdateClauses.push(`phone = $${userUpdateValues.length + 1}`); userUpdateValues.push(phone); }
    if (locationCountry !== undefined) { userUpdateClauses.push(`location_country = $${userUpdateValues.length + 1}`); userUpdateValues.push(locationCountry); }

    // Always update updated_at timestamp
    userUpdateClauses.push(`updated_at = NOW()`);

    if (userUpdateClauses.length > 1) { // More than just updated_at
      await sql.unsafe(`
        UPDATE users
        SET ${userUpdateClauses.join(', ')}
        WHERE id = $${userUpdateValues.length + 1}
      `, [...userUpdateValues, userId]);
    }


    if (decoded.userType === "photographer") {
      const { bio, specialties, cameraEquipment, hourlyRate, availabilityStatus } = body;

      let photographerProfileUpdateClauses: string[] = [];
      let photographerProfileUpdateValues: any[] = [];

      if (bio !== undefined) { photographerProfileUpdateClauses.push(`bio = $${photographerProfileUpdateValues.length + 1}`); photographerProfileUpdateValues.push(bio); }
      if (specialties !== undefined) { photographerProfileUpdateClauses.push(`specialties = $${photographerProfileUpdateValues.length + 1}`); photographerProfileUpdateValues.push(specialties); }
      if (cameraEquipment !== undefined) { photographerProfileUpdateClauses.push(`camera_equipment = $${photographerProfileUpdateValues.length + 1}`); photographerProfileUpdateValues.push(cameraEquipment); }
      if (hourlyRate !== undefined) { photographerProfileUpdateClauses.push(`hourly_rate = $${photographerProfileUpdateValues.length + 1}`); photographerProfileUpdateValues.push(hourlyRate); }
      if (availabilityStatus !== undefined) { photographerProfileUpdateClauses.push(`availability_status = $${photographerProfileUpdateValues.length + 1}`); photographerProfileUpdateValues.push(availabilityStatus); }
      if (profileImageUrl !== undefined) { photographerProfileUpdateClauses.push(`profile_image_url = $${photographerProfileUpdateValues.length + 1}`); photographerProfileUpdateValues.push(profileImageUrl); }

      photographerProfileUpdateClauses.push(`updated_at = NOW()`);

      if (photographerProfileUpdateClauses.length > 1) { // More than just updated_at
        await sql.unsafe(`
          UPDATE photographer_profiles
          SET ${photographerProfileUpdateClauses.join(', ')}
          WHERE user_id = $${photographerProfileUpdateValues.length + 1}
        `, [...photographerProfileUpdateValues, userId]);
      }
    } else if (decoded.userType === "client") {
      const { companyName } = body;

      let clientProfileUpdateClauses: string[] = [];
      let clientProfileUpdateValues: any[] = [];

      if (companyName !== undefined) { clientProfileUpdateClauses.push(`company_name = $${clientProfileUpdateValues.length + 1}`); clientProfileUpdateValues.push(companyName); }
      if (profileImageUrl !== undefined) { clientProfileUpdateClauses.push(`profile_image_url = $${clientProfileUpdateValues.length + 1}`); clientProfileUpdateValues.push(profileImageUrl); }

      clientProfileUpdateClauses.push(`updated_at = NOW()`);

      if (clientProfileUpdateClauses.length > 1) { // More than just updated_at
        await sql.unsafe(`
          UPDATE client_profiles
          SET ${clientProfileUpdateClauses.join(', ')}
          WHERE user_id = $${clientProfileUpdateValues.length + 1}
        `, [...clientProfileUpdateValues, userId]);
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// NEW: DELETE /api/users/me - Delete authenticated user's account
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Perform the deletion. Due to ON DELETE CASCADE on foreign keys
    // in photographer_profiles, client_profiles, jobs, job_applications,
    // portfolio_posts, reviews, messages, notifications, user_violations,
    // conversation_keys, abuse_reports, saved_photographers, and saved_jobs,
    // all related data will be automatically deleted or set to NULL.
    const [deletedUser] = await sql`
      DELETE FROM users
      WHERE id = ${userId}
      RETURNING id;
    `;

    if (deletedUser) {
      // Invalidate the auth token cookie
      cookies().delete("auth-token");
      return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Account not found or could not be deleted" }, { status: 404 });
    }

  } catch (error) {
    console.error("Delete user account API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}