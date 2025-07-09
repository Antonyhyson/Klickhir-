// Simplified auth library without external dependencies

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: "client" | "photographer"
  locationCountry: string
  currency: string
  isVerified: boolean
}

export function generateToken(user: User): string {
  const tokenData = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

export function verifyToken(token: string): any {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - decoded.timestamp > sevenDaysInMs) {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// Mock users for demo
export const mockUsers = {
  "sarah.johnson@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "sarah.johnson@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    userType: "photographer" as const,
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "michael.chen@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "michael.chen@example.com",
    firstName: "Michael",
    lastName: "Chen",
    userType: "photographer" as const,
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "emma.rodriguez@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "emma.rodriguez@example.com",
    firstName: "Emma",
    lastName: "Rodriguez",
    userType: "photographer" as const,
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "david.kim@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "david.kim@example.com",
    firstName: "David",
    lastName: "Kim",
    userType: "photographer" as const,
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
  "john.client@example.com": {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "john.client@example.com",
    firstName: "John",
    lastName: "Client",
    userType: "client" as const,
    locationCountry: "US",
    currency: "USD",
    isVerified: true,
  },
}
