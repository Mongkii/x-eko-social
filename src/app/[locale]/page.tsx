
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData, UserInteraction, InAppPurchaseItem, EkoDrop } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { initialEkoDrops } from '@/lib/eko-data'; // Updated import
import { AdMobBanner } from '@/components/admob-banner';
import { mockInAppPurchaseItems, premiumSubscriptionSku } from '@/lib/billing-data';
import { CheckCircle, ShoppingCart, Star, Play, Pause, Gift } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const LOCAL_STORAGE_LIKED_EKODROPS_KEY = 'eko_liked_drop_ids';

interface AppBridge { // Generic bridge for both platforms for simulation
  subscribe: (sku: string) => Promise<{ success: boolean; message?: string }>;
  purchase: (sku: string) => Promise<{ success: boolean; message?: string }>;
  getSubscriptionStatus: () => Promise<boolean>;
  getAvailableIaps: () => Promise<InAppPurchaseItem[]>;
}

declare global {
  interface Window {
    androidAppBridge?: AppBridge;
    webkit?: {
      messageHandlers?: {
        iosAppBridge?: {
          postMessage: (message: any) => void;
          // You'd need a way to get responses, e.g., global callback functions
        };
      };
    };
    // Callbacks for iOS bridge responses
    handleIOSSubscriptionStatus?: (status: boolean) => void;
    handleIOSAvailableIaps?: (iaps: InAppPurchaseItem[]) => void;
    handleIOSPurchaseResult?: (result: { success: boolean; message?: string }) => void;
    handleIOSSubscribeResult?: (result: { success: boolean; message?: string }) => void;
    updateSubscriptionStatus?: (isSubscribed: boolean) => void; // For native to call into webview
  }
}

export default function HomePage() {
  const t = useTranslations('HomePage');
  const tGlobal = useTranslations('Global');
  const currentLocale = useLocale();

  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedCategories, setFollowedCategories] = useState<Set<string>>(new Set(['Tech']));
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
  const { toast } = useToast();

  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [availableIAPs, setAvailableIAPs] = useState<InAppPurchaseItem[]>(mockInAppPurchaseItems);

  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLVideoElement | null>>({}); // Using <video> for audio for better control


  // Effect to detect mobile bridge and set up global handlers for iOS
  useEffect(() => {
    let mobileAppDetected = false;
    if (window.androidAppBridge) {
      setIsMobileApp(true);
      mobileAppDetected = true;
      window.androidAppBridge.getSubscriptionStatus()
        .then(status => setIsUserSubscribed(status))
        .catch(err => console.error("Error getting subscription status from Android bridge:", err));
      window.androidAppBridge.getAvailableIaps?.()
        .then(iaps => setAvailableIAPs(iaps))
        .catch(err => console.error("Error getting IAPs from Android bridge:", err));

    } else if (window.webkit?.messageHandlers?.iosAppBridge) {
      setIsMobileApp(true);
      mobileAppDetected = true;
      
      // Setup global callbacks for iOS bridge
      window.handleIOSSubscriptionStatus = (status) => setIsUserSubscribed(status);
      window.handleIOSAvailableIaps = (iaps) => setAvailableIAPs(iaps);
      window.handleIOSSubscribeResult = (result) => {
        if (result.success) {
          setIsUserSubscribed(true);
          toast({ title: t('subscriptionSuccessful'), description: t('youAreNowSubscribed') });
        } else {
          toast({ variant: "destructive", title: t('subscriptionFailed'), description: result.message || t('couldNotCompleteSubscription') });
        }
      };
      window.handleIOSPurchaseResult = ({success, message}) => {
         if (success) {
          toast({ title: t('purchaseSuccessful'), description: message || "Purchase completed."});
        } else {
          toast({ variant: "destructive", title: t('purchaseFailed'), description: message || "Could not complete purchase." });
        }
      };

      // Request initial data from iOS
      window.webkit.messageHandlers.iosAppBridge.postMessage({ command: 'getSubscriptionStatus' });
      window.webkit.messageHandlers.iosAppBridge.postMessage({ command: 'getAvailableIaps' });
    }

    if (mobileAppDetected) {
      window.updateSubscriptionStatus = (newStatus: boolean) => {
        setIsUserSubscribed(newStatus);
        toast({
          title: t('subscriptionUpdated'),
          description: t('subscriptionStatusNow', { status: newStatus ? t('statusActive') : t('statusInactive') }),
        });
      };
    } else {
      console.warn(t('mobileBridgeNotFound'));
    }
    return () => {
      if (window.updateSubscriptionStatus) delete window.updateSubscriptionStatus;
      if (window.handleIOSSubscriptionStatus) delete window.handleIOSSubscriptionStatus;
      if (window.handleIOSAvailableIaps) delete window.handleIOSAvailableIaps;
      if (window.handleIOSSubscribeResult) delete window.handleIOSSubscribeResult;
      if (window.handleIOSPurchaseResult) delete window.handleIOSPurchaseResult;
    };
  }, [toast, t]);

  useEffect(() => {
    setIsLoading(true);
    let likedIdsSet = new Set<string>();
    try {
      const storedLikedIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY) || '[]');
      likedIdsSet = new Set<string>(storedLikedIds);
    } catch (error) {
      console.error("Error reading liked EkoDrops from localStorage:", error);
    }

    // Map EkoDrop to FeedItemData, using currentLocale for initial transcript display
    const mappedInitialFeed = initialEkoDrops.map((ekoDrop: EkoDrop): FeedItemData => ({
      ...ekoDrop,
      title: ekoDrop.transcript?.[currentLocale]?.substring(0,50) || ekoDrop.transcript?.['en']?.substring(0,50) || `EkoDrop ${ekoDrop.id}`,
      description: ekoDrop.transcript?.[currentLocale] || ekoDrop.transcript?.['en'] || `Audio by user ${ekoDrop.userId}`,
      isLiked: likedIdsSet.has(ekoDrop.id),
      isDisliked: false,
      userRating: 0, // Default client-side rating
      posterUrl: `https://placehold.co/600x600.png?text=${encodeURIComponent(ekoDrop.userId)}`, // Example poster
      dataAiHint: 'abstract audio'
    }));

    setFeedItems(mappedInitialFeed);
    setIsLoading(false);
  }, [currentLocale]);

  const recordInteraction = useCallback((itemId: string, interaction: UserInteraction['interaction'], value?: string | number) => {
    setUserInteractions(prev => [...prev, { itemId, interaction, value, timestamp: new Date() }]);
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
    const currentIndex = feedItems.findIndex(item => item.id === endedItemId);
    if (currentIndex !== -1 && currentIndex < feedItems.length - 1) {
      const nextItem = feedItems[currentIndex + 1];
      handlePlayRequest(nextItem.id);
    } else {
      setCurrentPlayingId(null); // Stop if it's the last item or not found
    }
  };

  const handleRate = (itemId: string, rating: number) => {
    const item = feedItems.find(i => i.id === itemId);
    setFeedItems(prevItems =>
      prevItems.map(i => i.id === itemId ? { ...i, userRating: rating } : i)
    );
    if (item) {
      recordInteraction(itemId, 'rate', rating);
      toast({ title: tGlobal('ratingSubmittedToastTitle'), description: tGlobal('ratingSubmittedToastDescription', { title: item.title, rating }) });
    }
  };

  const handleToggleLike = (itemId: string) => {
    const item = feedItems.find(i => i.id === itemId);
    if (!item) return;

    const isNowLiked = !item.isLiked;
    setFeedItems(prevItems =>
      prevItems.map(i => i.id === itemId ? { ...i, isLiked: isNowLiked, isDisliked: isNowLiked ? false : i.isDisliked } : i)
    );

    recordInteraction(itemId, isNowLiked ? 'like' : 'unlike');
    toast({
      title: isNowLiked ? tGlobal('likedToastTitle') : tGlobal('unlikedToastTitle'),
      description: isNowLiked ? tGlobal('likedToastDescription', { title: item.title }) : tGlobal('unlikedToastDescription', { title: item.title })
    });

    try {
      const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY) || '[]');
      const likedIdsSet = new Set<string>(storedLikedIds);
      if (isNowLiked) {
        likedIdsSet.add(itemId);
      } else {
        likedIdsSet.delete(itemId);
      }
      localStorage.setItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY, JSON.stringify(Array.from(likedIdsSet)));
    } catch (error) {
      console.error("Error updating liked EkoDrops in localStorage:", error);
    }
  };
  
  const handleToggleDislike = (itemId: string) => {
    const item = feedItems.find(i => i.id === itemId);
    if (!item) return;

    const isNowDisliked = !item.isDisliked;
    setFeedItems(prevItems =>
      prevItems.map(i => {
        if (i.id === itemId) {
          const newIsLiked = isNowDisliked ? false : i.isLiked; // Unlike if disliked
          return { ...i, isDisliked: isNowDisliked, isLiked: newIsLiked };
        }
        return i;
      })
    );
    
    recordInteraction(itemId, 'dislike');
    toast({
      title: isNowDisliked ? tGlobal('dislikedToastTitle') : tGlobal('dislikeRemovedToastTitle'),
      description: isNowDisliked ? tGlobal('dislikedToastDescription', { title: item.title }) : tGlobal('dislikeRemovedToastDescription', { title: item.title })
    });

    if (isNowDisliked && item.isLiked) { // Also remove from liked if it was liked
      try {
        const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY) || '[]');
        const likedIdsSet = new Set<string>(storedLikedIds);
        if (likedIdsSet.has(itemId)) {
            likedIdsSet.delete(itemId);
            localStorage.setItem(LOCAL_STORAGE_LIKED_EKODROPS_KEY, JSON.stringify(Array.from(likedIdsSet)));
        }
      } catch (error) {
        console.error("Error removing from liked EkoDrops after dislike:", error);
      }
    }
  };

  const handleToggleFollowCategory = (category: string) => {
    const isNowFollowing = !followedCategories.has(category);
    setFollowedCategories(prev => {
      const newSet = new Set(prev);
      if (isNowFollowing) newSet.add(category);
      else newSet.delete(category);
      return newSet;
    });
    recordInteraction(category, isNowFollowing ? 'followCategory' : 'unfollowCategory');
    toast({
      title: isNowFollowing ? tGlobal('followedCategoryToastTitle') : tGlobal('unfollowedCategoryToastTitle'),
      description: isNowFollowing ? tGlobal('followedCategoryToastDescription', {category}) : tGlobal('unfollowedCategoryToastDescription', {category})
    });
  };

  const handlePersonalizeFeed = async () => {
    // Placeholder for BRD - AI personalization is a backend task
    toast({ title: t('aiMagicToastTitle'), description: t('aiMagicToastDescription') });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFeedItems(prev => [...prev].sort(() => Math.random() - 0.5)); // Simulate by shuffling
    toast({ title: t('aiFeedPersonalizedToastTitle'), description: t('aiFeedPersonalizedToastDescription')});
  };

  const handleSubscribe = async (sku: string) => {
    toast({ title: t('processingSubscription'), description: t('pleaseWait') });
    try {
      if (window.androidAppBridge?.subscribe) {
        const result = await window.androidAppBridge.subscribe(sku);
        if (result.success) {
          setIsUserSubscribed(true);
          toast({ title: t('subscriptionSuccessful'), description: t('youAreNowSubscribed') });
        } else {
          toast({ variant: "destructive", title: t('subscriptionFailed'), description: result.message || t('couldNotCompleteSubscription') });
        }
      } else if (window.webkit?.messageHandlers?.iosAppBridge) {
        window.webkit.messageHandlers.iosAppBridge.postMessage({ command: 'subscribe', sku: sku });
        // Result handled by window.handleIOSSubscribeResult
      } else {
        console.warn(t('mobileBridgeNotFound') + " " + t('featureOnlyInMobileApp'));
        // Simulate for web
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsUserSubscribed(true);
        toast({ title: t('subscriptionSuccessful'), description: t('youAreNowSubscribed') + " (Simulated for Web)"});
      }
    } catch (error) {
      console.error("Error during subscription process:", error);
      toast({ variant: "destructive", title: t('subscriptionError'), description: String(error) });
    }
  };

  const handlePurchaseProduct = async (sku: string, title: string) => {
     toast({ title: t('purchasingItem', {title}), description: t('pleaseWait') });
     try {
      if (window.androidAppBridge?.purchase) {
        const result = await window.androidAppBridge.purchase(sku);
        if (result.success) {
          toast({ title: t('purchaseSuccessful'), description: t('youHavePurchasedItem', {title}) });
        } else {
          toast({ variant: "destructive", title: t('purchaseFailed'), description: result.message || t('couldNotPurchaseItem', {title}) });
        }
      } else if (window.webkit?.messageHandlers?.iosAppBridge) {
        window.webkit.messageHandlers.iosAppBridge.postMessage({ command: 'purchase', sku: sku, title: title });
        // Result handled by window.handleIOSPurchaseResult
      } else {
        console.warn(t('mobileBridgeNotFound') + " " + t('featureOnlyInMobileApp'));
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({ title: t('purchaseSuccessful'), description: t('youHavePurchasedItem', {title}) + " (Simulated for Web)"});
      }
    } catch (error) {
      console.error(`Error during purchase process for SKU ${sku}:`, error);
      toast({ variant: "destructive", title: t('purchaseError'), description: String(error) });
    }
  };

  const handleSimulatedRewardedAd = () => {
    toast({
      title: "Rewarded Ad Watched (Simulated)",
      description: "You've earned 30 ad-free minutes!",
      duration: 5000,
    });
    // In a real app, you'd update user state, possibly in Firestore
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader onPersonalize={handlePersonalizeFeed} />
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory">
        {isMobileApp && (
          <div className="p-4 border-b bg-card">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                  {t('billingSectionTitle')}
                </CardTitle>
                <CardDescription>{t('billingSectionDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-md font-semibold mb-1">{t('subscriptionStatus')}</h3>
                  <p className={isUserSubscribed ? "text-green-600" : "text-red-600"}>
                    {isUserSubscribed ? t('premiumActive') : t('notSubscribed')}
                  </p>
                </div>
                {!isUserSubscribed && (
                  <Button onClick={() => handleSubscribe(premiumSubscriptionSku)} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" /> {t('subscribeToPremium')}
                  </Button>
                )}
                <div>
                  <h3 className="text-md font-semibold mt-4 mb-2">{t('availableInAppItems')}</h3>
                  <div className="space-y-3">
                    {availableIAPs.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center bg-background">
                        <div>
                          <p className="font-medium">{item.title}</p> {/* Assuming IAP titles are not translated dynamically from a static list */}
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePurchaseProduct(item.id, item.title)}
                          disabled={item.type === 'subscription' && isUserSubscribed && item.id === premiumSubscriptionSku}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> {item.price}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
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
        ) : (
          feedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="h-full">
              <FeedItemCard
                item={item}
                currentLocale={currentLocale}
                followedCategories={followedCategories}
                onRate={handleRate}
                onToggleLike={handleToggleLike}
                onToggleDislike={handleToggleDislike}
                onToggleFollowCategory={handleToggleFollowCategory}
                isPlaying={currentPlayingId === item.id}
                onPlayRequest={handlePlayRequest}
                onAudioEnded={() => handleAudioEnded(item.id)}
                audioRef={(el) => audioRefs.current[item.id] = el}
                onSimulatedReward={handleSimulatedRewardedAd}
              />
              {(index + 1) % 3 === 0 && process.env.NEXT_PUBLIC_ADMOB_BANNER_AD_UNIT_ID && !item.isAd && (
                <div className="h-auto w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
                  <AdMobBanner />
                </div>
              )}
            </div>
          ))
        )}
         {feedItems.length === 0 && !isLoading && (
          <div className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
            <p className="text-muted-foreground">{t('noFeedItems')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
