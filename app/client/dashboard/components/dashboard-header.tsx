// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/app/client/dashboard/components/dashboard-header.tsx
"use client"

import { useState, useEffect } from "react" // Import useEffect, useState
import { Bell, Search, User, Check, X } from "lucide-react" // Added Check, X icons
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu" // Import DropdownMenu components
import { ScrollArea } from "@/components/ui/scroll-area" // Import ScrollArea
import { Badge } from "@/components/ui/badge" // Import Badge

interface Notification {
  id: string;
  userId: string;
  type: string;
  entityId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function DashboardHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown visibility

  // Function to fetch notifications
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setErrorNotifications(null);
    try {
      const response = await fetch("/api/notifications"); // Fetch all for now, can filter by ?read=false
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      const data = await response.json();
      const fetchedNotifications: Notification[] = data.notifications.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt).toLocaleString(), // Format timestamp
      }));
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
    } catch (e: any) {
      console.error("Error fetching notifications:", e);
      setErrorNotifications("Failed to load notifications.");
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications on component mount and every time dropdown opens
  useEffect(() => {
    if (isDropdownOpen) { // Only fetch when dropdown is intended to be open
      fetchNotifications();
    }
  }, [isDropdownOpen]);

  // Optionally, fetch unread count periodically or on interval for a badge without opening dropdown
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?read=false");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.notifications.length);
        }
      } catch (e) {
        console.error("Failed to fetch unread count:", e);
      }
    };
    fetchUnreadCount(); // Initial fetch
    const interval = setInterval(fetchUnreadCount, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);


  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error("Failed to mark notification as read:", await response.text());
      }
    } catch (e) {
      console.error("Network error marking notification as read:", e);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      // For simplicity, make individual requests. For many, a batch API would be better.
      await Promise.all(
        unreadNotifications.map(n =>
          fetch(`/api/notifications/${n.id}/read`, { method: "PUT" })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
    }
  };


  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Klickhiré</h1>
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input type="search" placeholder="Search jobs, companies..." className="pl-10 w-64" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-0" align="end">
                <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="h-auto px-2 py-1 text-xs">
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
                  ) : errorNotifications ? (
                    <div className="p-4 text-center text-sm text-red-500">{errorNotifications}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No new notifications.</div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                        className={`flex items-start gap-2 p-3 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex-1 text-sm">
                          <p className={`font-medium ${!notification.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-1 ${!notification.isRead ? 'text-blue-600' : 'text-gray-500'}`}>
                            {notification.createdAt}
                          </p>
                        </div>
                        {notification.isRead ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    )
}