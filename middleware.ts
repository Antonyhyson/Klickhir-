import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function verifySimpleToken(token: string): any {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    // Check if token is not older than 7 days
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - decoded.timestamp > sevenDaysInMs) {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const protectedRoutes = [
    "/client/dashboard",
    "/photographer/dashboard",
    "/client/post-job",
    "/photographer/post-work",
    "/photographer/profile",
  ]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const decoded = verifySimpleToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check user type for specific routes
    if (request.nextUrl.pathname.startsWith("/client/") && decoded.userType !== "client") {
      return NextResponse.redirect(new URL("/photographer/dashboard", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/photographer/") && decoded.userType !== "photographer") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/client/:path*", "/photographer/:path*"],
}
