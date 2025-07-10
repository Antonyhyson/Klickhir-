// antonyhyson/clickhire/ClickHire-bc73fc2893e84ce2bf95362a5d693145d19c7114/app/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UserCog, KeyRound, Trash2, Loader2, Link2, LogOut } from "lucide-react" // Added Link2, LogOut
import { GlitterBackground } from "@/components/glitter-background"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CurrentUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "client" | "photographer";
  profile_image_url?: string;
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState(false);

  // Delete Account States
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);
      setErrorUser(null);
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const data = await response.json();
        setCurrentUser(data.user);
      } catch (e: any) {
        console.error("Error fetching current user:", e);
        setErrorUser("Failed to load user profile. Please try again.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordChangeMessage(null);
    setPasswordChangeError(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeMessage("New passwords do not match.");
      setPasswordChangeError(true);
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      setIsChangingPassword(false);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeMessage("New password must be at least 8 characters long.");
      setPasswordChangeError(true);
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/users/me/password", { // This endpoint will be created in next step
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        setPasswordChangeMessage(data.message || "Password changed successfully.");
        setPasswordChangeError(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        toast({
          title: "Success",
          description: data.message || "Your password has been updated.",
          variant: "default",
        });
      } else {
        setPasswordChangeMessage(data.error || "Failed to change password.");
        setPasswordChangeError(true);
        toast({
          title: "Error",
          description: data.error || "Failed to update password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordChangeMessage("Network error. Please try again.");
      setPasswordChangeError(true);
      toast({
        title: "Network Error",
        description: "Could not connect to server to change password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/users/me", { // This endpoint will have DELETE method added in next step
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
          variant: "default",
        });
        // Redirect to home or login page after successful deletion
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        toast({
          title: "Deletion Failed",
          description: errorData.error || "Failed to delete account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to server to delete account.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        window.location.href = "/login"; // Redirect to login page
      } else {
        toast({
          title: "Logout Failed",
          description: "Could not log out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Network Error",
        description: "Failed to log out due to network issues.",
        variant: "destructive",
      });
    }
  };


  if (loadingUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300">Loading settings...</p>
      </div>
    );
  }

  if (errorUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">{errorUser}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <GlitterBackground />
        <p className="relative z-10 text-xl text-red-500">User not found or not authenticated.</p>
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
            <div className="flex items-center space-x-2">
              <Link
                href={currentUser.user_type === "client" ? "/client/dashboard" : "/photographer/dashboard"}
                className={`inline-flex items-center ${currentUser.user_type === "client" ? "text-blue-600 hover:text-blue-800" : "text-green-600 hover:text-green-800"}`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold">ChromaConnect</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-light text-slate-800 dark:text-white mb-8">Account Settings</h1>

          <div className="grid gap-8">
            {/* General Profile Link */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserCog className="h-6 w-6" /> General Profile
                </CardTitle>
                <CardDescription>Manage your personal information and public profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={currentUser.user_type === "client" ? "/client/profile" : "/photographer/profile"}>
                  <Button variant="outline">
                    Go to {currentUser.user_type === "client" ? "Client Profile" : "Photographer Profile"} <Link2 className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <KeyRound className="h-6 w-6" /> Change Password
                </CardTitle>
                <CardDescription>Update your account password for enhanced security.</CardDescription>
              </CardHeader>
              <CardContent>
                {passwordChangeMessage && (
                  <div className={`mb-4 p-3 rounded-md ${passwordChangeError ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                    <p className={`text-sm ${passwordChangeError ? "text-red-600" : "text-green-600"}`}>{passwordChangeMessage}</p>
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                    {isChangingPassword && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="bg-white/95 backdrop-blur-sm border-destructive text-destructive">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trash2 className="h-6 w-6" /> Delete Account
                </CardTitle>
                <CardDescription>Permanently delete your account and all associated data.</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeletingAccount}>
                      {isDeletingAccount ? "Deleting..." : "Delete Account"}
                      {isDeletingAccount && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeletingAccount} className="bg-destructive hover:bg-destructive/90">
                        Confirm Deletion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Placeholder for other necessary options */}
            {/*
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-6 w-6" /> Security & MFA
                </CardTitle>
                <CardDescription>Manage your multi-factor authentication settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Manage MFA (Future Feature)</Button>
              </CardContent>
            </Card>
            */}

          </div>
        </div>
      </div>
    </div>
  )
}