"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlitterBackground } from "@/components/glitter-background"
import { MessageInterface } from "@/components/messaging/message-interface"

// Mock data for demo
const mockConversations = [
  {
    id: "1",
    participants: [
      {
        id: "client-1",
        name: "John Smith",
        avatar: "/placeholder.svg?height=40&width=40",
        userType: "client" as const,
      },
      {
        id: "photographer-1",
        name: "Sarah Parker",
        avatar: "/placeholder.svg?height=40&width=40",
        userType: "photographer" as const,
      },
    ],
    encryptionKey: "demo-encryption-key-12345",
  },
  {
    id: "2",
    participants: [
      {
        id: "client-2",
        name: "Emily Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        userType: "client" as const,
      },
      {
        id: "photographer-1",
        name: "Sarah Parker",
        avatar: "/placeholder.svg?height=40&width=40",
        userType: "photographer" as const,
      },
    ],
    encryptionKey: "demo-encryption-key-67890",
  },
]

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get("contact")

  const [currentUser] = useState({
    id: "photographer-1",
    name: "Sarah Parker",
    userType: "photographer" as const,
  })

  // Auto-select conversation if contact parameter is provided
  useEffect(() => {
    if (contactId) {
      const conversation = mockConversations.find((conv) => conv.participants.some((p) => p.id === contactId))
      if (conversation) {
        // Auto-select this conversation
        console.log("Auto-selecting conversation with:", contactId)
      }
    }
  }, [contactId])

  const handleSendMessage = async (conversationId: string, encryptedMessage: string) => {
    console.log("Sending message:", { conversationId, encryptedMessage })
    // In real app, this would call the API
  }

  const handleReportAbuse = async (conversationId: string, messageId: string, reason: string) => {
    console.log("Reporting abuse:", { conversationId, messageId, reason })
    // In real app, this would call the abuse reporting API
  }

  return (
    <div className="min-h-screen relative">
      <GlitterBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link
                  href="/photographer/dashboard"
                  className="inline-flex items-center text-green-600 hover:text-green-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-green-600" />
                <span className="font-semibold">ClickHire</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Photographer
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Messages</h1>
              <p className="text-gray-600">Secure, end-to-end encrypted messaging with automatic content moderation</p>
            </div>

            <MessageInterface
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              currentUserType={currentUser.userType}
              conversations={mockConversations}
              onSendMessage={handleSendMessage}
              onReportAbuse={handleReportAbuse}
            />

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Security & Safety</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All messages are end-to-end encrypted for your privacy</li>
                <li>• Inappropriate language is automatically detected and may result in account suspension</li>
                <li>• First violation: Warning | 2+ violations: 2-day ban (increases by 2 days each time)</li>
                <li>• Report any abusive behavior using the report function</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
