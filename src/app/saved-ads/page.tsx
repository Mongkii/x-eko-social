
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData, UserInteraction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { allAvailableAds } from '@/lib/ads-data'; // Using the shared ads data
import { ArrowLeft } from 'lucide-react';

const LOCAL_STORAGE_LIKED_ADS_KEY = 'shopyme_liked_ad_ids';

export default function SavedAdsPage() {
  const [savedItems, setSavedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedCategories, setFollowedCategories] = useState<Set<string>>(new Set()); // Independent for this page or could be synced
  const { toast } = useToast();

  const loadSavedAds = useCallback(() => {
    setIsLoading(true);
    try {
      const storedLikedIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
      const likedIdsSet = new Set<string>(storedLikedIds);
      
      const filteredAds = allAvailableAds
        .filter(ad => likedIdsSet.has(ad.id))
        .map(ad => ({
          ...ad,
          isLiked: true, // They are here because they are liked
          // Reset other interaction states or load them if also persisted
          isDisliked: false, 
          userRating: ad.userRating || 0, 
        }));
      
      setSavedItems(filteredAds);
    } catch (error) {
      console.error("Error loading saved ads from localStorage:", error);
      setSavedItems([]);
      toast({ variant: "destructive", title: "Error", description: "Could not load saved ads." });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadSavedAds();
  }, [loadSavedAds]);

  // Listener for storage changes to update if another tab changes liked ads
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_LIKED_ADS_KEY) {
        loadSavedAds();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSavedAds]);

  const recordInteraction = useCallback((itemId: string, interaction: UserInteraction['interaction'], value?: string | number) => {
    // For this page, we might not need to store full interactions,
    // but this function is here if detailed logging per page is desired.
    console.log("Interaction on Saved Ads page:", { itemId, interaction, value, timestamp: new Date() });
  }, []);

  const handleRate = (itemId: string, rating: number) => {
    let itemTitle: string | undefined;
    setSavedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          itemTitle = item.title;
          return { ...item, userRating: rating };
        }
        return item;
      })
    );
    if (itemTitle){
      recordInteraction(itemId, 'rate', rating);
      toast({ title: "Rating submitted!", description: `You rated "${itemTitle}" ${rating} stars.` });
      // Note: This rating won't persist back to allAvailableAds or home page unless explicitly saved to a shared source.
    }
  };

  const handleToggleLike = (itemId: string) => {
    let itemTitle: string | undefined;
    let itemIsNowLiked = false;

    setSavedItems(prevItems =>
      prevItems.filter(item => {
        if (item.id === itemId) {
          itemTitle = item.title;
          itemIsNowLiked = !item.isLiked; // Should always be true -> false here
          if (itemIsNowLiked) { // If it somehow becomes liked again on this page (e.g. error)
            return true; 
          }
          return false; // Remove from saved items if unliked
        }
        return true;
      })
    );

    if (itemTitle) {
      recordInteraction(itemId, 'unlike'); // Explicitly 'unlike'
      toast({ title: "Unliked!", description: `You unliked "${itemTitle}". It has been removed from your saved ads.`});

      try {
        const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
        const likedIdsSet = new Set<string>(storedLikedIds);
        likedIdsSet.delete(itemId);
        localStorage.setItem(LOCAL_STORAGE_LIKED_ADS_KEY, JSON.stringify(Array.from(likedIdsSet)));
      } catch (error) {
        console.error("Error updating liked ads in localStorage:", error);
      }
    }
  };
  
  const handleToggleDislike = (itemId: string) => {
    // Disliking on this page will also effectively "unlike" and remove it.
    handleToggleLike(itemId); // Reuse unlike logic, toast message might need adjustment if specific dislike feedback is needed
    const item = savedItems.find(i => i.id === itemId);
    if(item){
         toast({ title: "Disliked & Removed!", description: `You disliked "${item.title}". It has been removed from your saved ads.`});
    }
  };


  const handleToggleFollowCategory = (category: string) => {
    let isNowFollowing: boolean | undefined;
    setFollowedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
        isNowFollowing = false;
      } else {
        newSet.add(category);
        isNowFollowing = true;
      }
      return newSet;
    });
     if (isNowFollowing !== undefined) {
      recordInteraction(category, isNowFollowing ? 'followCategory' : 'unfollowCategory');
      toast({ title: isNowFollowing ? "Followed Category!" : "Unfollowed Category!", description: `You ${isNowFollowing ? "are now following" : "unfollowed"} "${category}".`});
    }
  };

  // The "Personalize My Feed" button in AppHeader is not directly relevant here.
  // We pass a dummy function or could modify AppHeader to hide it based on route.
  const dummyPersonalize = async () => {
    toast({title: "Info", description: "Feed personalization is available on the main feed page."});
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader onPersonalize={dummyPersonalize} />
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory p-4">
        <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Feed
                </Link>
            </Button>
            <h1 className="text-2xl font-bold text-center">My Saved Ads</h1>
            <div className="w-[130px]"></div> {/* Spacer to balance the back button */}
        </div>

        {isLoading ? (
          // Multiple skeletons for loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4 mb-4">
              <div className="w-full max-w-md mx-auto h-[calc(100%-80px)] md:h-[calc(100%-100px)] flex flex-col">
                <Skeleton className="aspect-[9/16] w-full rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          ))
        ) : savedItems.length > 0 ? (
          savedItems.map((item, index) => (
            <div key={`${item.id}-${index}-saved`} className="mb-8 last:mb-0"> {/* Added margin between cards */}
                 <FeedItemCard
                    item={item}
                    followedCategories={followedCategories}
                    onRate={handleRate}
                    onToggleLike={handleToggleLike}
                    onToggleDislike={handleToggleDislike}
                    onToggleFollowCategory={handleToggleFollowCategory}
                />
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>You haven&apos;t saved any ads yet.</p>
            <p>Like an ad in the main feed to save it here!</p>
          </div>
        )}
      </main>
    </div>
  );
}
