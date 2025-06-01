
"use client"; // Needs to be client for hooks like useState, useEffect, useAuth

import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { EkoPostCard } from "@/components/feed/EkoPostCard";
import type { EkoPost } from "@/lib/types";
import { firestore } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  const [posts, setPosts] = useState<EkoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const postsQuery = query(
          collection(firestore, "posts"),
          where("visibility", "==", "public"), // Only public posts for now
          orderBy("createdAt", "desc"),
          limit(20) // Paginate later
        );
        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure createdAt is a Firestore Timestamp for EkoPostCard or convert as needed
          createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt : Timestamp.fromDate(new Date()), 
        })) as EkoPost[];
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load EkoDrops. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Eko Feed</h1>
        
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 text-muted-foreground">Loading EkoDrops...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg mb-2">The feed is quiet right now...</p>
            <p className="text-sm text-muted-foreground">Be the first to share an EkoDrop or check back later!</p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map(post => (
              <EkoPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
