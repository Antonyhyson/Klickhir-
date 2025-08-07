// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/api/gigs/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// This is a mock API route that simulates fetching photography gigs from job boards.
// In a real application, you would implement web scraping logic here using a library
// like 'cheerio' or 'puppeteer' to extract data from external websites.

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

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || decoded.locationCountry; // Use user's country as default
    
    console.log(`[MOCK] Fetching gigs for location: ${location}`);

    // Simulated data from a web scraper
    const mockGigs = [
      {
        id: "gig_1",
        title: "Portrait Shoot for a Fashion Brand",
        company: "Vogue Magazine",
        location: "New York, NY",
        description: "Seeking a professional portrait photographer for an upcoming fashion editorial.",
        date: "2025-09-10",
        pay: "Negotiable",
        link: "https://example-job-board.com/gig/vogue-shoot",
      },
      {
        id: "gig_2",
        title: "Assistant Photographer for a Wedding",
        company: "Everlasting Photos",
        location: "London, UK",
        description: "Experienced assistant needed to help with a large wedding event in London. Must have own equipment.",
        date: "2025-08-25",
        pay: "£25/hour",
        link: "https://example-job-board.com/gig/wedding-assistant",
      },
      {
        id: "gig_3",
        title: "Commercial Product Photographer",
        company: "Gourmet Eats Inc.",
        location: "Chicago, IL",
        description: "Food photographer needed for a new menu launch. High-quality product shots required.",
        date: "2025-09-01",
        pay: "$500/day",
        link: "https://another-job-site.com/gig/food-photoshoot",
      },
      {
        id: "gig_4",
        title: "Event Photographer for a Tech Conference",
        company: "Innovate Tech",
        location: "Berlin, Germany",
        description: "Looking for a photographer to capture key moments at our annual tech conference.",
        date: "2025-09-15",
        pay: "€40/hour",
        link: "https://berlin-jobs.de/gig/tech-event",
      },
    ];

    // Filter by location (a simple mock filter)
    const filteredGigs = mockGigs.filter(gig => gig.location.toLowerCase().includes(location.toLowerCase()));

    return NextResponse.json({ gigs: filteredGigs }, { status: 200 });

  } catch (error) {
    console.error("Get gigs API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}