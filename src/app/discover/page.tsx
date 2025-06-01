
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Zap, Users, TrendingUp } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Discover EkoDrops</h1>
          <p className="text-lg text-muted-foreground">
            Find new voices, trending topics, and communities.
          </p>
        </header>

        <div className="mb-10">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search EkoDrops, users, or topics..."
              className="w-full pl-10 pr-4 py-3 rounded-full text-base shadow-sm"
            />
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="mr-3 h-6 w-6 text-accent" />
            Trending Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for Trending EkoDrop Cards */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Trending Topic #{i}</CardTitle>
                  <CardDescription>Short description of the trend.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 mr-1.5" /> 10k+ Ekos
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Users className="mr-3 h-6 w-6 text-accent" />
            Suggested For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for Suggested User/Content Cards */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="text-center p-4 hover:shadow-lg transition-shadow">
                <img
                  src="https://placehold.co/100x100.png"
                  alt={`Suggested User ${i}`}
                  data-ai-hint="user avatar"
                  className="rounded-full w-20 h-20 mx-auto mb-3 border-2 border-accent"
                />
                <h3 className="font-semibold">EkoUser {i}</h3>
                <p className="text-xs text-muted-foreground mb-2">@ekouser_{i}</p>
                <Button size="sm" variant="outline">Follow</Button>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
