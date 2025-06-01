
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Mic, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <Mic className="w-24 h-24 text-accent mx-auto mb-8 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Eko: <span className="text-accent">Your Voice</span>, Amplified.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10">
            The next-generation voice-first social network. Share, discover, and connect through the power of audio.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="w-full sm:w-auto group">
              <Link href="/feed">
                Explore Feed
                <Zap className="ml-2 h-5 w-5 group-hover:animate-ping" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/auth/signup">
                Join Eko Today
                <Users className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <section className="mt-20 md:mt-32 py-16 bg-card/50 rounded-xl shadow-xl">
          <h2 className="text-3xl font-semibold mb-12">Why Eko?</h2>
          <div className="grid md:grid-cols-3 gap-8 px-6">
            <div className="p-6 rounded-lg ">
              <Mic className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Purely Voice</h3>
              <p className="text-muted-foreground">Experience social media through authentic voice interactions. No filters, just real voices.</p>
            </div>
            <div className="p-6 rounded-lg ">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect Deeply</h3>
              <p className="text-muted-foreground">Engage in meaningful conversations and build genuine connections with voice comments and DMs.</p>
            </div>
            <div className="p-6 rounded-lg ">
              <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover Sounds</h3>
              <p className="text-muted-foreground">Explore a universe of EkoDrops, from personal stories to original music and podcasts.</p>
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
