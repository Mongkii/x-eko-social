
"use client"; 

import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Languages, Edit3, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context"; 
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types"; 
import { Textarea } from "@/components/ui/textarea";


export default function SettingsPage() {
  const { user, userProfile, loading: authLoading } = useAuth(); 

  const [settings, setSettings] = useState({
    profileVisibility: userProfile?.privacy?.profile || "public",
    defaultPostVisibility: userProfile?.privacy?.defaultPostVisibility || "public",
    enableNotifications: true, 
    language: userProfile?.language || "en",
  });

  useEffect(() => {
    if (userProfile) {
      setSettings({
        profileVisibility: userProfile.privacy?.profile || "public",
        defaultPostVisibility: userProfile.privacy?.defaultPostVisibility || "public",
        enableNotifications: true, 
        language: userProfile.language || "en",
      });
    }
  }, [userProfile]);


  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12">
          <Card className="text-center max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please log in to view your settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild><Link href="/auth/login?redirect=/settings">Login</Link></Button>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  const handleSavePrivacySettings = () => {
    console.log("Saving privacy settings:", settings.profileVisibility, settings.defaultPostVisibility);
  };
  const handleSaveNotificationSettings = () => {
    console.log("Saving notification settings:", settings.enableNotifications);
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 pb-24"> {/* Added pb-24 for player */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-lg text-muted-foreground">Manage your account, profile, and preferences.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <nav className="space-y-2">
              <a href="#profile" className="flex items-center p-2 rounded-md hover:bg-muted">
                <User className="mr-2 h-5 w-5" /> Profile
              </a>
              <a href="#account" className="flex items-center p-2 rounded-md hover:bg-muted">
                <KeyRound className="mr-2 h-5 w-5" /> Account
              </a>
              <a href="#privacy" className="flex items-center p-2 rounded-md hover:bg-muted">
                <Shield className="mr-2 h-5 w-5" /> Privacy
              </a>
              <a href="#notifications" className="flex items-center p-2 rounded-md hover:bg-muted">
                <Bell className="mr-2 h-5 w-5" /> Notifications
              </a>
              <a href="#appearance" className="flex items-center p-2 rounded-md hover:bg-muted">
                <Palette className="mr-2 h-5 w-5" /> Appearance
              </a>
              <a href="#language" className="flex items-center p-2 rounded-md hover:bg-muted">
                <Languages className="mr-2 h-5 w-5" /> Language
              </a>
            </nav>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card id="profile">
              <CardHeader>
                <CardTitle className="flex items-center"><User className="mr-2 h-6 w-6 text-accent" /> Profile Settings</CardTitle>
                <CardDescription>Update your public profile information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                  <Label htmlFor="username-display">Username</Label>
                  <Input id="username-display" value={userProfile.username || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="bio-display">Bio</Label>
                  <Textarea 
                    id="bio-display" 
                    value={userProfile.bio || 'No bio set.'} 
                    disabled 
                    className="min-h-[60px] bg-muted/50"
                  />
                </div>
                <Button asChild variant="outline">
                  <Link href={`/profile/${userProfile.username_lowercase}/edit`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Go to Full Profile Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card id="account">
              <CardHeader>
                <CardTitle className="flex items-center"><KeyRound className="mr-2 h-6 w-6 text-accent" /> Account Settings</CardTitle>
                <CardDescription>Manage your login credentials and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-display">Email</Label>
                  <Input id="email-display" type="email" value={user.email || ''} disabled />
                </div>
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>
            
            <Card id="privacy">
              <CardHeader>
                <CardTitle className="flex items-center"><Shield className="mr-2 h-6 w-6 text-accent" /> Privacy Settings</CardTitle>
                <CardDescription>Control who can see your profile and EkoDrops.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="block mb-2">Profile Visibility</Label>
                  <RadioGroup 
                    value={settings.profileVisibility} 
                    onValueChange={(value) => setSettings(s => ({...s, profileVisibility: value}))}
                    name="profileVisibility"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="pv-public" />
                      <Label htmlFor="pv-public">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="pv-private" />
                      <Label htmlFor="pv-private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="block mb-2">Default EkoDrop Visibility</Label>
                  <RadioGroup 
                    value={settings.defaultPostVisibility} 
                    onValueChange={(value) => setSettings(s => ({...s, defaultPostVisibility: value}))}
                    name="defaultPostVisibility"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="dpv-public" />
                      <Label htmlFor="dpv-public">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="followers-only" id="dpv-followers" />
                      <Label htmlFor="dpv-followers">Followers Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="dpv-private" />
                      <Label htmlFor="dpv-private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
                 <Button onClick={handleSavePrivacySettings}>Save Privacy Settings</Button>
              </CardContent>
            </Card>

            <Card id="notifications">
              <CardHeader>
                <CardTitle className="flex items-center"><Bell className="mr-2 h-6 w-6 text-accent" /> Notification Settings</CardTitle>
                <CardDescription>Choose what notifications you receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-notifications" className="flex flex-col space-y-1">
                    <span>Enable All Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive notifications for likes, comments, follows, etc.
                    </span>
                  </Label>
                  <Switch 
                    id="enable-notifications" 
                    checked={settings.enableNotifications} 
                    onCheckedChange={(checked) => setSettings(s => ({...s, enableNotifications: checked}))}
                  />
                </div>
                <Button onClick={handleSaveNotificationSettings}>Save Notification Settings</Button>
              </CardContent>
            </Card>

            <Card id="appearance">
                <CardHeader>
                    <CardTitle className="flex items-center"><Palette className="mr-2 h-6 w-6 text-accent"/> Appearance</CardTitle>
                    <CardDescription>Customize how Eko looks. Theme and Font Size are managed in the app header.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Theme and Font Size controls are available globally in the application header.</p>
                </CardContent>
            </Card>

            <Card id="language">
                <CardHeader>
                    <CardTitle className="flex items-center"><Languages className="mr-2 h-6 w-6 text-accent"/> Language</CardTitle>
                    <CardDescription>Choose your preferred language for the Eko app. Current: {settings.language.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Language selection will be available here.</p>
                     <Button variant="outline" disabled>Change Language (Coming Soon)</Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
