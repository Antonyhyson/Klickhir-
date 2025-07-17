// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/messages/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlitterBackground } from "@/components/glitter-background"
import { MessageInterface } from "@/components/messaging/message-interface"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Import Avatar components

// Define interfaces for fetched data
interface Participant {
  id: string;
  name: string;
  avatar: string;
  userType: "client" | "photographer";
}

interface Conversation {
  id: string;
  participants: Participant[];
  encryptionKey: string;
  lastMessage?: {
    encryptedContent: string;
    timestamp: string;
  };
}

interface CurrentUser {
  id: string;
  name: string;
  userType: "client" | "photographer";
  avatar?: string; // Add avatar field
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get("contact")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null); // State for current user profile
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const [errorCurrentUser, setErrorCurrentUser] = useState<string | null>(null);


  // Fetch current user's profile
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      setLoadingCurrentUser(true);
      setErrorCurrentUser(null);
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error(`Failed to fetch current user profile: ${response.status}`);
        }
        const data = await response.json();
        setCurrentUser({
          id: data.user.id,
          name: `${data.user.first_name} ${data.user.last_name}`,
          userType: data.user.user_type,
          avatar: data.user.profile_image_url || "/placeholder.svg?height=40&width=40",
        });
      } catch (e: any) {
        console.error("Error fetching current user profile:", e);
        setErrorCurrentUser("Failed to load your profile information.");
      } finally {
        setLoadingCurrentUser(false);
      }
    };
    fetchCurrentUserProfile();
  }, []);

  // Fetch conversations when current user is loaded
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return; // Only fetch conversations once currentUser is loaded

      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/messaging/conversations")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setConversations(data.conversations)
      } catch (err: any) {
        console.error("Failed to fetch conversations:", err)
        setError("Failed to load conversations. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]); // Depend on currentUser


  // Auto-select conversation if contact parameter is provided
  useEffect(() => {
    if (contactId && conversations.length > 0) {
      const conversation = conversations.find((conv) => conv.participants.some((p) => p.id === contactId))
      if (conversation) {
        console.log("Auto-selecting conversation with:", contactId)
        // Note: MessageInterface manages its own selectedConversation state internally.
        // If you want to programmatically select, you'd pass it as a prop.
        // For this demo, we'll rely on the user clicking a conversation.
      }
    }
  }, [contactId, conversations])

  const handleSendMessage = async (conversationId: string, encryptedMessage: string, originalMessage: string) => {
    console.log("Sending message:", { conversationId, encryptedMessage, originalMessage })
    try {
      const response = await fetch("/api/messaging/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId, // This param is not used by the current backend send route but kept for consistency
          recipientId: conversations.find(conv => conv.id === conversationId)?.participants.find(p => p.id !== (currentUser?.id || ""))?.id,
          encryptedMessage,
          originalMessage, // Send original message for server-side moderation
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Message sending failed: ${data.error}`);
        console.error("Message send API error:", data.error);
      } else {
        console.log("Message sent successfully:", data.messageId);
        // In a real app, you would then update the messages state with the new message
      }
    } catch (err) {
      console.error("Network error sending message:", err);
      alert("Failed to send message due to network error.");
    }
  }

  const handleReportAbuse = async (conversationId: string, messageId: string, reason: string) => {
    console.log("Reporting abuse:", { conversationId, messageId, reason })
    // In real app, this would call the abuse reporting API
    alert(`Reporting message ${messageId} for reason: ${reason}. (Action mocked)`);
  }

  if (loadingCurrentUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Loading user data...</p>
      </div>
    );
  }

  if (errorCurrentUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">{errorCurrentUser}</p>
      </div>
    );
  }

  if (!currentUser) {
    // This case should ideally not be hit if errorCurrentUser is handled
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">Authentication failed. Please log in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">{error}</p>
      </div>
    );
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
                  href={currentUser.userType === 'client' ? "/client/dashboard" : "/photographer/dashboard"}
                  className={`inline-flex items-center ${currentUser.userType === 'client' ? 'text-blue-600 hover:text-blue-800' : 'text-green-600 hover:text-green-800'}`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className={`h-5 w-5 ${currentUser.userType === 'client' ? 'text-blue-600' : 'text-green-600'}`} />
                <span className="font-semibold">Klickhiré</span>
                <Badge variant="secondary" className={`${currentUser.userType === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {currentUser.userType.charAt(0).toUpperCase() + currentUser.userType.slice(1)}
                </Badge>
                {/* Current User Avatar in header */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
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

            {currentUser.id && currentUser.name && currentUser.userType ? (
              <MessageInterface
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                currentUserType={currentUser.userType}
                conversations={conversations}
                onSendMessage={handleSendMessage}
                onReportAbuse={handleReportAbuse}
              />
            ) : (
              <p className="text-center text-red-500">Error: Current user data is missing for messaging.</p>
            )}


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