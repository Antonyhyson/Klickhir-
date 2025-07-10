// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth" // Import verifyToken from lib/auth

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const protectedRoutes = [
    "/client/dashboard",
    "/photographer/dashboard",
    "/client/post-job",
    "/photographer/post-work",
    "/photographer/profile",
    "/messages",
    "/client/photographer/",
    "/client/saved-photographers", // NEW: Protected route
    "/photographer/saved-jobs", // NEW: Protected route
    "/settings", // NEW: Protected route
  ]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      // Redirect to login page if no token
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      // Redirect to login if token is invalid or expired
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check user type for specific routes
    if (request.nextUrl.pathname.startsWith("/client/")) {
        // Allow client to view any photographer profile
        if (request.nextUrl.pathname.startsWith("/client/photographer/")) {
            return NextResponse.next();
        }
        if (decoded.userType !== "client") {
            return NextResponse.redirect(new URL("/photographer/dashboard", request.url));
        }
    }


    if (request.nextUrl.pathname.startsWith("/photographer/") && decoded.userType !== "photographer") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url))
    }

    // Allow access if checks pass
    return NextResponse.next()
  }

  // Allow access for non-protected routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/client/:path*", "/photographer/:path*", "/messages/:path*", "/settings", "/api/users/me/password"], // Added /settings and /api/users/me/password
}