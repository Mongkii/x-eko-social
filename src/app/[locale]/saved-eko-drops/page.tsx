
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData, UserInteraction, EkoDrop } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { allAvailableEkoDrops } from '@/lib/eko-data'; // Updated import
import { ArrowLeft } from 'lucide-react';
import { Link, usePathname } from '@/navigation'; // For localized navigation
import { useTranslations, useLocale } from 'next-intl';

const LOCAL_STORAGE_LIKED_EKODROPS_KEY = 'eko_liked_drop_ids';

export default function SavedEkoDropsPage() {
  const t = useTranslations('SavedEkoDropsPage');
  const tGlobal = useTranslations('Global');
  const currentLocale = useLocale();

  const [savedItems, setSavedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedCategories, setFollowedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const loadSavedEkoDrops = useCallback(() => {
    setIsLoading(true);
    try {
      const storedLikedIdsJson = localStorage.getItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY);
      const storedLikedIds = storedLikedIdsJson ? JSON.parse(storedLikedIdsJson) : [];
      const likedIdsSet = new Set<string>(storedLikedIds);
      
      const filteredEkoDrops = allAvailableEkoDrops
        .filter(ekoDrop => likedIdsSet.has(ekoDrop.id))
        .map((ekoDrop: EkoDrop): FeedItemData => ({
          ...ekoDrop,
          title: ekoDrop.transcript?.[currentLocale]?.substring(0,50) || ekoDrop.transcript?.['en']?.substring(0,50) || `EkoDrop ${ekoDrop.id}`,
          description: ekoDrop.transcript?.[currentLocale] || ekoDrop.transcript?.['en'] || `Audio by user ${ekoDrop.userId}`,
          isLiked: true,
          isDisliked: false,
          userRating: 0,
          posterUrl: `https://placehold.co/600x600.png?text=${encodeURIComponent(ekoDrop.userId)}`,
          dataAiHint: 'abstract audio'
        }));
      
      setSavedItems(filteredEkoDrops);
    } catch (error) {
      console.error("Error loading saved EkoDrops from localStorage:", error);
      setSavedItems([]);
      toast({ variant: "destructive", title: t('errorLoadingSavedAds')});
    }
    setIsLoading(false);
  }, [toast, t, currentLocale]);

  useEffect(() => {
    loadSavedEkoDrops();
  }, [loadSavedEkoDrops]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_LIKED_EKODROPS_KEY) {
        loadSavedEkoDrops();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSavedEkoDrops]);

  const recordInteraction = useCallback((itemId: string, interaction: UserInteraction['interaction'], value?: string | number) => {
    // console.log("Interaction on Saved EkoDrops page:", { itemId, interaction, value, timestamp: new Date() });
    // This function might be expanded to send interaction data to a backend in a real app
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
    const item = savedItems.find(i => i.id === itemId);
    setSavedItems(prevItems =>
      prevItems.map(i => i.id === itemId ? { ...i, userRating: rating } : i)
    );
    if(item){
      recordInteraction(itemId, 'rate', rating);
      toast({ title: tGlobal('ratingSubmittedToastTitle'), description: tGlobal('ratingSubmittedToastDescription', {title: item.title, rating}) });
    }
  };

  const handleToggleLike = (itemId: string) => { // This effectively "unsaves"
    const item = savedItems.find(i => i.id === itemId);
    if (!item) return;

    setSavedItems(prevItems => prevItems.filter(i => i.id !== itemId));
    recordInteraction(itemId, 'unlike');
    toast({ title: tGlobal('unlikedToastTitle'), description: t('unlikedAndRemovedToastDescription', {title: item.title}) });

    try {
      const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY) || '[]');
      const likedIdsSet = new Set<string>(storedLikedIds);
      likedIdsSet.delete(itemId);
      localStorage.setItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY, JSON.stringify(Array.from(likedIdsSet)));
    } catch (error) {
      console.error("Error updating liked EkoDrops in localStorage:", error);
    }
  };
  
  const handleToggleDislike = (itemId: string) => { // Disliking also unsaves it
    const item = savedItems.find(i => i.id === itemId);
    if (!item) return;
    handleToggleLike(itemId); // Removes it from saved
    toast({ title: tGlobal('dislikedToastTitle'), description: t('dislikedAndRemovedToastDescription', {title: item.title}) });
  };

  const handleToggleFollowCategory = (category: string) => {
    const isNowFollowing = !followedCategories.has(category);
    setFollowedCategories(prev => {
      const newSet = new Set(prev);
      if (isNowFollowing) newSet.add(category); else newSet.delete(category);
      return newSet;
    });
    recordInteraction(category, isNowFollowing ? 'followCategory' : 'unfollowCategory');
    toast({ 
        title: isNowFollowing ? tGlobal('followedCategoryToastTitle') : tGlobal('unfollowedCategoryToastTitle'), 
        description: isNowFollowing ? tGlobal('followedCategoryToastDescription', {category}) : tGlobal('unfollowedCategoryToastDescription', {category})
      });
  };

  const dummyPersonalize = async () => {
    // AI personalization is backend logic as per BRD
    toast({title: t('infoToastTitle'), description: t('personalizeInfoDescription')});
  };

  const handleSimulatedRewardedAd = () => {
    toast({
      title: "Rewarded Ad Watched (Simulated)",
      description: "You've earned 30 ad-free minutes!",
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader onPersonalize={dummyPersonalize} />
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory p-4">
        <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('backToFeed')}
                </Link>
            </Button>
            <h1 className="text-2xl font-bold text-center">{t('mySavedAds')}</h1> {/* Key updated here from mySavedAds to mySavedEkoDrops */}
            <div className="w-[130px]"></div> {/* Spacer */}
        </div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-saved-${index}`} className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4 mb-4">
              <div className="w-full max-w-md mx-auto h-[calc(100%-80px)] md:h-[calc(100%-100px)] flex flex-col">
                <Skeleton className="aspect-square w-full rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))
        ) : savedItems.length > 0 ? (
          savedItems.map((item, index) => (
            <div key={`${item.id}-${index}-saved`} className="mb-8 last:mb-0 h-full">
                 <FeedItemCard
                    item={item}
                    currentLocale={currentLocale}
                    followedCategories={followedCategories}
                    onRate={handleRate}
                    onToggleLike={handleToggleLike} // This will "unsave"
                    onToggleDislike={handleToggleDislike} // This will also "unsave"
                    onToggleFollowCategory={handleToggleFollowCategory}
                    isPlaying={currentPlayingId === item.id}
                    onPlayRequest={handlePlayRequest}
                    onAudioEnded={() => handleAudioEnded(item.id)}
                    audioRef={(el) => audioRefs.current[item.id] = el}
                    onSimulatedReward={handleSimulatedRewardedAd}
                />
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>{t('noSavedAdsYet')}</p>
            <p>{t('likeAdToSave')}</p>
          </div>
        )}
      </main>
    </div>
  );
}

