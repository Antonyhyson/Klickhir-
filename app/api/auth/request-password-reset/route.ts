// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/auth/request-password-reset/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto"; // Import crypto module

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const [user] = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (!user) {
      // Return a generic success message even if user not found to prevent email enumeration
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." }, { status: 200 });
    }

    // Generate a secure, URL-safe token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Store the token and expiry in the database
    await sql`
      UPDATE users
      SET reset_password_token = ${token},
          reset_password_expires = ${expires.toISOString()}::timestamp
      WHERE id = ${user.id};
    `;

    // In a real application, you would send an email here.
    // The email would contain a link like:
    // `https://your-app-url/reset-password/${token}`
    console.log(`[DEMO] Password Reset Token for ${email}: ${token}`);
    console.log(`[DEMO] Reset Link: /reset-password/${token}`); // For local testing

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." }, { status: 200 });

  } catch (error) {
    console.error("Request password reset API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}