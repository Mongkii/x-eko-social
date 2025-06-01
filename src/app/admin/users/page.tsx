
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserProfile } from "@/lib/types"; // Ensure UserProfile is defined
import { Timestamp } from "firebase/firestore";

// Mock data - replace with Firebase data fetching
const mockUsers: UserProfile[] = [
  { id: "user1", username: "ekoFanatic", email: "fan@example.com", language: "en", privacy: { profile: "public", defaultPostVisibility: "public" }, createdAt: Timestamp.now(), followersCount: 1200, followingCount: 300 },
  { id: "user2", username: "voiceQueen", email: "queen@example.com", language: "ar", privacy: { profile: "private", defaultPostVisibility: "followers-only" }, createdAt: Timestamp.now(), followersCount: 5600, followingCount: 50 },
  { id: "user3", username: "soundWaveSurfer", email: "surfer@example.com", language: "es", privacy: { profile: "public", defaultPostVisibility: "public" }, createdAt: Timestamp.now(), followersCount: 800, followingCount: 150 },
  // Add more mock users
];


export default function AdminUsersPage() {
  // State for search, pagination, etc. would go here

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add User (Manual)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View, edit, and manage user accounts.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users by username or email..." className="pl-8 w-full md:w-1/3" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Profile Status</TableHead>
                <TableHead className="hidden md:table-cell">Followers</TableHead>
                <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                  <TableCell>{user.language.toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge variant={user.privacy.profile === 'public' ? 'default' : 'secondary'}>
                      {user.privacy.profile}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.followersCount || 0}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.createdAt?.toDate().toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Suspend User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {/* Add CardFooter for pagination if needed */}
      </Card>
    </div>
  );
}

// Helper to make email optional for UserProfile in mock data
interface MockUserProfile extends Omit<UserProfile, 'email'> {
  email?: string;
}
