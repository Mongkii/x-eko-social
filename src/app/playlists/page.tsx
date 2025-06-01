
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic, PlusCircle, Music2 } from "lucide-react";

// Mock data for playlists
const mockPlaylists = [
  { id: "1", name: "My Favorite Talks", ekoCount: 12, privacy: "public" , coverImage: "https://placehold.co/300x200.png?text=Talks" },
  { id: "2", name: "Morning Motivation", ekoCount: 7, privacy: "private", coverImage: "https://placehold.co/300x200.png?text=Motivation" },
  { id: "3", name: "Deep Dives", ekoCount: 23, privacy: "followers-only", coverImage: "https://placehold.co/300x200.png?text=Dives" },
];


export default function PlaylistsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">My Eko Playlists</h1>
            <p className="text-lg text-muted-foreground">
              Curate and listen to your favorite EkoDrops.
            </p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Playlist
          </Button>
        </header>

        {mockPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPlaylists.map((playlist) => (
              <Card key={playlist.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-[3/2] bg-muted flex items-center justify-center">
                  <img 
                    src={playlist.coverImage} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover" 
                    data-ai-hint="playlist cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{playlist.name}</CardTitle>
                  <CardDescription>
                    {playlist.ekoCount} EkoDrops &bull; {playlist.privacy.charAt(0).toUpperCase() + playlist.privacy.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Music2 className="mr-2 h-4 w-4" /> View Playlist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <ListMusic className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No Playlists Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start creating playlists to organize your favorite EkoDrops.
            </p>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Playlist
            </Button>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
