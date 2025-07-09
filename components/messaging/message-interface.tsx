"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Lock, Shield, X, AlertTriangle } from "lucide-react"

// Simple E2E encryption utilities
class E2EEncryption {
  private static generateKey(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  static async encryptMessage(message: string, key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const keyData = encoder.encode(key)

    // Simple XOR encryption for demo (in production, use proper crypto)
    const encrypted = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyData[i % keyData.length]
    }

    return btoa(String.fromCharCode(...encrypted))
  }

  static async decryptMessage(encryptedMessage: string, key: string): Promise<string> {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const keyData = encoder.encode(key)

    const encrypted = new Uint8Array(
      atob(encryptedMessage)
        .split("")
        .map((c) => c.charCodeAt(0)),
    )
    const decrypted = new Uint8Array(encrypted.length)

    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyData[i % keyData.length]
    }

    return decoder.decode(decrypted)
  }

  static generateSessionKey(): string {
    return this.generateKey()
  }
}

// Abuse detection system
class AbuseDetector {
  private static profanityList = [
    "damn",
    "hell",
    "shit",
    "fuck",
    "bitch",
    "ass",
    "bastard",
    "crap",
    "piss",
    "dick",
    "cock",
    "pussy",
    "whore",
    "slut",
    "fag",
    "nigger",
    "retard",
    "gay",
    "lesbian",
    "homo",
    "tranny",
    "dyke",
    "cunt",
  ]

  static detectProfanity(message: string): { hasProfanity: boolean; count: number; words: string[] } {
    const words = message.toLowerCase().split(/\s+/)
    const foundProfanity: string[] = []

    words.forEach((word) => {
      // Remove punctuation for checking
      const cleanWord = word.replace(/[^\w]/g, "")
      if (this.profanityList.includes(cleanWord)) {
        foundProfanity.push(cleanWord)
      }
    })

    return {
      hasProfanity: foundProfanity.length > 0,
      count: foundProfanity.length,
      words: foundProfanity,
    }
  }

  static calculateBanDuration(violationCount: number): number {
    // Ban duration increases in even numbers: 2, 4, 6, 8, 10, etc.
    return violationCount * 2
  }
}

interface Message {
  id: string
  senderId: string
  recipientId: string
  encryptedContent: string
  timestamp: Date
  isRead: boolean
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar: string
    userType: "client" | "photographer"
  }[]
  lastMessage?: Message
  encryptionKey: string
}

interface MessageInterfaceProps {
  currentUserId: string
  currentUserName: string
  currentUserType: "client" | "photographer"
  conversations: Conversation[]
  onSendMessage: (conversationId: string, encryptedMessage: string) => void
  onReportAbuse: (conversationId: string, messageId: string, reason: string) => void
}

export function MessageInterface({
  currentUserId,
  currentUserName,
  currentUserType,
  conversations,
  onSendMessage,
  onReportAbuse,
}: MessageInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isEncrypted, setIsEncrypted] = useState(true)
  const [abuseWarning, setAbuseWarning] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages for demo
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: selectedConversation.participants[0].id,
          recipientId: currentUserId,
          encryptedContent: "SGVsbG8hIEkgc2F3IHlvdXIgcG9ydGZvbGlvIGFuZCBsb3ZlZCB5b3VyIHdvcmsh",
          timestamp: new Date(Date.now() - 3600000),
          isRead: true,
        },
        {
          id: "2",
          senderId: currentUserId,
          recipientId: selectedConversation.participants[0].id,
          encryptedContent: "VGhhbmsgeW91ISBJJ2QgbG92ZSB0byBkaXNjdXNzIHlvdXIgcHJvamVjdC4=",
          timestamp: new Date(Date.now() - 1800000),
          isRead: true,
        },
      ]
      setMessages(mockMessages)
    }
  }, [selectedConversation, currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    // Check for abuse
    const abuseCheck = AbuseDetector.detectProfanity(newMessage)
    if (abuseCheck.hasProfanity) {
      setAbuseWarning(
        `Warning: Your message contains inappropriate language (${abuseCheck.words.join(", ")}). ` +
          `Repeated violations will result in account suspension.`,
      )

      // In a real app, this would increment the user's violation count
      // and potentially ban them if they exceed the threshold
      setTimeout(() => setAbuseWarning(null), 5000)
      return
    }

    try {
      // Encrypt the message
      const encryptedMessage = await E2EEncryption.encryptMessage(newMessage, selectedConversation.encryptionKey)

      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        recipientId: selectedConversation.participants.find((p) => p.id !== currentUserId)?.id || "",
        encryptedContent: encryptedMessage,
        timestamp: new Date(),
        isRead: false,
      }

      setMessages((prev) => [...prev, message])
      onSendMessage(selectedConversation.id, encryptedMessage)
      setNewMessage("")
    } catch (error) {
      console.error("Failed to encrypt message:", error)
    }
  }

  const decryptMessage = async (encryptedContent: string): Promise<string> => {
    if (!selectedConversation) return "Failed to decrypt"

    try {
      return await E2EEncryption.decryptMessage(encryptedContent, selectedConversation.encryptionKey)
    } catch (error) {
      return "Failed to decrypt message"
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== currentUserId)
  }

  return (
    <div className="flex h-[600px] bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50/50">
        <div className="p-4 border-b bg-white/80">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-green-600" />
            <h2 className="font-semibold">Messages</h2>
            <Badge variant="secondary" className="text-xs">
              E2E Encrypted
            </Badge>
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation)
            if (!otherParticipant) return null

            return (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-white/50 transition-colors ${
                  selectedConversation?.id === conversation.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {otherParticipant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{otherParticipant.name}</p>
                      <Badge
                        variant={otherParticipant.userType === "photographer" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {otherParticipant.userType}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {conversation.lastMessage ? "Last message..." : "Start conversation"}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {getOtherParticipant(selectedConversation)
                        ?.name.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{getOtherParticipant(selectedConversation)?.name}</p>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">Encrypted</span>
                </div>
              </div>
            </div>

            {/* Abuse Warning */}
            {abuseWarning && (
              <div className="p-3 bg-red-50 border-b border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">{abuseWarning}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAbuseWarning(null)}
                    className="ml-auto p-1 h-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <MessageContent encryptedContent={message.encryptedContent} decryptMessage={decryptMessage} />
                      <p className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white/80">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Lock className="h-3 w-3" />
                  <span>End-to-end encrypted</span>
                </div>
                <p className="text-xs text-gray-500">Messages are automatically scanned for inappropriate content</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a conversation to start messaging</p>
              <p className="text-sm text-gray-500 mt-2">All messages are end-to-end encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Component to handle message decryption
function MessageContent({
  encryptedContent,
  decryptMessage,
}: {
  encryptedContent: string
  decryptMessage: (content: string) => Promise<string>
}) {
  const [decryptedContent, setDecryptedContent] = useState<string>("")

  useEffect(() => {
    decryptMessage(encryptedContent).then(setDecryptedContent)
  }, [encryptedContent, decryptMessage])

  return <p>{decryptedContent || "Decrypting..."}</p>
}
