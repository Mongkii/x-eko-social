
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link'; // Changed from '@/navigation'
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData, UserInteraction, EkoDrop } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { allAvailableAds } from '@/lib/ads-data'; 
import { ArrowLeft } from 'lucide-react';

const LOCAL_STORAGE_LIKED_ADS_KEY = 'eko_liked_drop_ids';

export default function SavedEkoDropsPage() { 
  const [savedItems, setSavedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedCategories, setFollowedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLVideoElement | null>>({});


  const loadSavedEkoDrops = useCallback(() => {
    setIsLoading(true);
    try {
      const storedLikedIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
      const likedIdsSet = new Set<string>(storedLikedIds);
      
      const filteredEkoDrops = allAvailableAds 
        .filter(ekoDrop => likedIdsSet.has(ekoDrop.id))
        .map((ekoDrop: EkoDrop): FeedItemData => ({ 
          id: ekoDrop.id,
          type: ekoDrop.isAd ? 'ad' : 'content',
          audioUrl: ekoDrop.audioURL,
          videoUrl: ekoDrop.audioURL,
          posterUrl: ekoDrop.rawAudioURL, 
          dataAiHint: 'voice audio',
          title: ekoDrop.transcript?.['en']?.substring(0,50) || `EkoDrop ${ekoDrop.id}`,
          description: ekoDrop.transcript?.['en'] || `Audio by user ${ekoDrop.userId}`,
          categories: ekoDrop.hashtags || [],
          userRating: 0, 
          isLiked: true, 
          isDisliked: false, 
          userId: ekoDrop.userId,
          duration: ekoDrop.duration,
          likesCount: ekoDrop.likes,
          createdAt: ekoDrop.createdAt,
          advertiser: ekoDrop.advertiserName,
        }));
      
      setSavedItems(filteredEkoDrops);
    } catch (error) {
      console.error("Error loading saved EkoDrops from localStorage:", error);
      setSavedItems([]);
      toast({ variant: "destructive", title: "Could not load saved EkoDrops."});
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadSavedEkoDrops();
  }, [loadSavedEkoDrops]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_LIKED_ADS_KEY) {
        loadSavedEkoDrops();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSavedEkoDrops]);

  const recordInteraction = useCallback((itemId: string, interaction: UserInteraction['interaction'], value?: string | number) => {
    console.log("Interaction on Saved EkoDrops page:", { itemId, interaction, value, timestamp: new Date() });
  }, []);

  const handlePlayRequest = (itemId: string) => {
    if (currentPlayingId && audioRefs.current[currentPlayingId]) {
      audioRefs.current[currentPlayingId]?.pause();
    }
    setCurrentPlayingId(itemId);
     if (audioRefs.current[itemId]) {
      audioRefs.current[itemId]?.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  const handleAudioEnded = (endedItemId: string) => {
    const currentIndex = savedItems.findIndex(item => item.id === endedItemId);
    if (currentIndex !== -1 && currentIndex < savedItems.length - 1) {
      const nextItem = savedItems[currentIndex + 1];
      handlePlayRequest(nextItem.id);
    } else {
      setCurrentPlayingId(null); 
    }
  };

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
    }
  };

  const handleToggleLike = (itemId: string) => {
    const item = savedItems.find(i => i.id === itemId);
    let itemTitle = item?.title || "EkoDrop";

    setSavedItems(prevItems =>
      prevItems.filter(item => item.id !== itemId)
    );

    recordInteraction(itemId, 'unlike');
    toast({ title: `You unliked "${itemTitle}". It has been removed from your saved EkoDrops.` });

    try {
      const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
      const likedIdsSet = new Set<string>(storedLikedIds);
      likedIdsSet.delete(itemId);
      localStorage.setItem(LOCAL_STORAGE_LIKED_ADS_KEY, JSON.stringify(Array.from(likedIdsSet)));
    } catch (error) {
      console.error("Error updating liked EkoDrops in localStorage:", error);
    }
  };
  
  const handleToggleDislike = (itemId: string) => {
    const item = savedItems.find(i => i.id === itemId);
    handleToggleLike(itemId); 
    if(item){
         toast({ title: `You disliked "${item.title || "EkoDrop"}". It has been removed from your saved EkoDrops.`});
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
      toast({ 
        title: isNowFollowing ? "Followed Category!" : "Unfollowed Category!", 
        description: isNowFollowing ? `You are now following "${category}".` : `You unfollowed "${category}".`
      });
    }
  };

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
            <h1 className="text-2xl font-bold text-center">My Saved EkoDrops</h1>
            <div className="w-[130px]"></div> 
        </div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4 mb-4">
              <div className="w-full max-w-md mx-auto h-[calc(100%-80px)] md:h-[calc(100%-100px)] flex flex-col">
                <Skeleton className="aspect-square w-full rounded-t-lg" />
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
            <div key={`${item.id}-${index}-saved`} className="mb-8 last:mb-0 h-full">
                 <FeedItemCard
                    item={item}
                    followedCategories={followedCategories}
                    onRate={handleRate}
                    onToggleLike={handleToggleLike}
                    onToggleDislike={handleToggleDislike}
                    onToggleFollowCategory={handleToggleFollowCategory}
                    isPlaying={currentPlayingId === item.id}
                    onPlayRequest={handlePlayRequest}
                    onAudioEnded={() => handleAudioEnded(item.id)}
                    audioRef={(el) => audioRefs.current[item.id] = el}
                />
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>You haven't saved any EkoDrops yet.</p>
            <p>Like an EkoDrop in the main feed to save it here!</p>
          </div>
        )}
      </main>
    </div>
  );
}
