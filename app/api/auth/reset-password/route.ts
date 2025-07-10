// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/auth/reset-password/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmNewPassword } = await request.json();

    if (!token || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ error: "Token, new password, and confirmation are required" }, { status: 400 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    // Find user by reset token and check if it's still valid
    const [user] = await sql`
      SELECT id, reset_password_expires FROM users
      WHERE reset_password_token = ${token}
    `;

    if (!user || new Date(user.reset_password_expires) < new Date()) {
      return NextResponse.json({ error: "Invalid or expired password reset token" }, { status: 400 });
    }

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token fields
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          reset_password_token = NULL,
          reset_password_expires = NULL,
          updated_at = NOW()
      WHERE id = ${user.id};
    `;

    return NextResponse.json({ message: "Your password has been successfully reset." }, { status: 200 });

  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}