
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Languages, Edit3, KeyRound } from "lucide-react";
import Link from "next/link"; // For Edit Profile link

// Mock current settings - in a real app, this would come from useAuth() or a settings context/hook
const mockUserSettings = {
  username: "EkoUser123",
  email: "user@eko.app",
  profileVisibility: "public",
  defaultPostVisibility: "public",
  language: "en",
  enableNotifications: true,
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-lg text-muted-foreground">Manage your account, profile, and preferences.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            {/* Placeholder for settings navigation if needed, or just keep it simple */}
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
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={mockUserSettings.username} />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea id="bio" className="w-full p-2 border rounded-md min-h-[80px]" placeholder="Tell us about yourself..."></textarea>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/profile/${mockUserSettings.username.toLowerCase()}/edit`}> {/* Hypothetical edit page */}
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
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={mockUserSettings.email} disabled />
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
                  <RadioGroup defaultValue={mockUserSettings.profileVisibility} name="profileVisibility">
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
                  <RadioGroup defaultValue={mockUserSettings.defaultPostVisibility} name="defaultPostVisibility">
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
                 <Button>Save Privacy Settings</Button>
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
                  <Switch id="enable-notifications" defaultChecked={mockUserSettings.enableNotifications} />
                </div>
                {/* Add more granular notification settings here */}
                <Button>Save Notification Settings</Button>
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
                    <CardDescription>Choose your preferred language for the Eko app.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Language selection dropdown - to be implemented */}
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
