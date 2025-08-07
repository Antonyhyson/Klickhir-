// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/instagram/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// This is a mock API route to simulate fetching photos from Instagram.
// In a real application, this would:
// 1. Check for a valid authentication token from the user.
// 2. Use a stored Instagram access token for the user.
// 3. Make a call to the Instagram Graph API (e.g., /me/media).
// 4. Return the photo data, including URLs, captions, and other metadata.

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "photographer") {
      return NextResponse.json({ error: "Only photographers can access this API" }, { status: 403 });
    }

    // Simulate fetching a list of recent photos from Instagram
    const mockPhotos = [
      {
        id: "ig_photo_1",
        caption: "Golden hour in the city.",
        url: "/placeholder.svg?height=400&width=600&text=Instagram Photo 1",
      },
      {
        id: "ig_photo_2",
        caption: "Capturing a beautiful moment.",
        url: "/placeholder.svg?height=600&width=400&text=Instagram Photo 2",
      },
      {
        id: "ig_photo_3",
        caption: "Urban street photography.",
        url: "/placeholder.svg?height=400&width=400&text=Instagram Photo 3",
      },
      {
        id: "ig_photo_4",
        caption: "Behind the scenes.",
        url: "/placeholder.svg?height=600&width=600&text=Instagram Photo 4",
      },
      {
        id: "ig_photo_5",
        caption: "Nature's perfect light.",
        url: "/placeholder.svg?height=800&width=600&text=Instagram Photo 5",
      },
    ];

    return NextResponse.json({ photos: mockPhotos }, { status: 200 });

  } catch (error) {
    console.error("Instagram API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}