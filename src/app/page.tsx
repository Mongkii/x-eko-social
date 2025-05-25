
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData, UserInteraction, InAppPurchaseItem, EkoDrop } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { initialFeedItems, allAvailableAds } from '@/lib/ads-data'; // Will be updated to use EkoDrop structure
import { AdMobBanner } from '@/components/admob-banner';
import { mockInAppPurchaseItems, premiumSubscriptionSku } from '@/lib/billing-data';
import { CheckCircle, ShoppingCart, Star, Play, Pause } from 'lucide-react';
import { format } from 'date-fns'; 

const LOCAL_STORAGE_LIKED_ADS_KEY = 'eko_liked_drop_ids'; 


// Simulate a direct API call function for DeepSeek (replace with actual implementation)
async function personalizeAdFeedDeepSeek(input: { userPastInteractions: string; availableAds: string; }): Promise<{ personalizedAdFeed: string; }> {
  console.log("Simulating DeepSeek personalizeAdFeed with input:", input);
  // In a real scenario, this would call your DeepSeek API function from src/ai/flows/
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { personalizedAdFeed: "DeepSeek recommends: TechGiant Smartphone Pro, FashionBrandX Summer Collection, Dream Vacation Package (based on your interests in Tech and Travel)" };
}


interface AndroidAppBridge {
  subscribe: (sku: string) => Promise<{ success: boolean; message?: string }>;
  purchase: (sku: string) => Promise<{ success: boolean; message?: string }>;
  getSubscriptionStatus: () => Promise<boolean>;
  getAvailableIaps: () => Promise<InAppPurchaseItem[]>;
}

interface IOSAppBridge {
  subscribe: (sku: string) => Promise<{ success: boolean; message?: string }>;
  purchase: (sku: string) => Promise<{ success: boolean; message?: string }>;
  getSubscriptionStatus: () => Promise<boolean>;
  getAvailableIaps: () => Promise<InAppPurchaseItem[]>;
}

declare global {
  interface Window {
    androidAppBridge?: AndroidAppBridge;
    iosAppBridge?: IOSAppBridge;
    updateSubscriptionStatus?: (isSubscribed: boolean) => void;
  }
}


export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [followedCategories, setFollowedCategories] = useState<Set<string>>(new Set(['Travel'])); 
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
  const { toast } = useToast();

  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [isIOSApp, setIsIOSApp] = useState(false);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [availableIAPs, setAvailableIAPs] = useState<InAppPurchaseItem[]>(mockInAppPurchaseItems);

  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLVideoElement | null>>({});


  useEffect(() => {
    const androidBridge = window.androidAppBridge;
    const iosBridge = window.iosAppBridge; 

    let mobileAppDetected = false;

    if (androidBridge && typeof androidBridge.getSubscriptionStatus === 'function') {
      setIsAndroidApp(true);
      mobileAppDetected = true;
      androidBridge.getSubscriptionStatus()
        .then(status => setIsUserSubscribed(status))
        .catch(err => console.error("Error getting subscription status from Android bridge:", err));
      
      setAvailableIAPs(mockInAppPurchaseItems); 

    } else if (iosBridge && typeof iosBridge.getSubscriptionStatus === 'function') {
      setIsIOSApp(true);
      mobileAppDetected = true;
      iosBridge.getSubscriptionStatus()
        .then(status => setIsUserSubscribed(status))
        .catch(err => console.error("Error getting subscription status from iOS bridge:", err));
      
      setAvailableIAPs(mockInAppPurchaseItems); 
    }

    if (mobileAppDetected) {
      window.updateSubscriptionStatus = (newStatus: boolean) => {
        setIsUserSubscribed(newStatus);
        toast({
          title: "Subscription Updated",
          description: `Subscription status is now: ${newStatus ? 'Active' : 'Inactive'}.`,
        });
      };
    } else {
      console.warn("No mobile app bridge (Android or iOS) found. Play/App Store Billing UI will be conditional or use defaults.");
    }

    return () => {
      if (window.updateSubscriptionStatus) {
        delete window.updateSubscriptionStatus;
      }
    }
  }, [toast]);


  useEffect(() => {
    setIsLoading(true);
    let likedIdsSet = new Set<string>();
    try {
      const storedLikedIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
      likedIdsSet = new Set<string>(storedLikedIds);
    } catch (error) {
      console.error("Error reading liked EkoDrops from localStorage:", error);
    }

    const mappedInitialFeed = initialFeedItems.map((item: EkoDrop): FeedItemData => ({
      id: item.id,
      type: item.isAd ? 'ad' : 'content',
      audioUrl: item.audioURL, 
      videoUrl: item.audioURL, 
      posterUrl: item.rawAudioURL, 
      dataAiHint: 'voice audio', 
      title: item.transcript?.['en']?.substring(0,50) || `EkoDrop ${item.id}`, 
      description: item.transcript?.['en'] || `Audio by user ${item.userId}`,
      categories: item.hashtags || [],
      userRating: 0, 
      isLiked: likedIdsSet.has(item.id),
      isDisliked: false, 
      userId: item.userId,
      duration: item.duration,
      transcript: item.transcript,
      sourceLanguage: item.sourceLanguage,
      likesCount: item.likes,
      createdAt: item.createdAt, 
      advertiser: item.advertiserName,
    }));

    setFeedItems(mappedInitialFeed);
    setIsLoading(false);
  }, []);

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
      setCurrentPlayingId(null); 
    }
  };
  
  const handleRate = (itemId: string, rating: number) => {
    let itemTitle: string | undefined;
    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          itemTitle = item.title;
          return { ...item, userRating: rating };
        }
        return item;
      })
    );
    if (itemTitle) {
      recordInteraction(itemId, 'rate', rating);
      toast({ title: "Rating submitted!", description: `You rated "${itemTitle}" ${rating} stars.` });
    }
  };

  const handleToggleLike = (itemId: string) => {
    let itemWasLiked: boolean | undefined;
    let itemTitle: string | undefined;

    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          itemWasLiked = item.isLiked;
          itemTitle = item.title;
          return { ...item, isLiked: !item.isLiked, isDisliked: false };
        }
        return item;
      })
    );

    if (itemTitle !== undefined && itemWasLiked !== undefined) {
      const itemIsNowLiked = !itemWasLiked;
      recordInteraction(itemId, itemIsNowLiked ? 'like' : 'unlike');
      toast({ 
        title: itemIsNowLiked ? "Liked!" : "Unliked!", 
        description: itemIsNowLiked ? `You liked "${itemTitle}".` : `You unliked "${itemTitle}".`
      });

      try {
        const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
        const likedIdsSet = new Set<string>(storedLikedIds);
        if (itemIsNowLiked) {
          likedIdsSet.add(itemId);
        } else {
          likedIdsSet.delete(itemId);
        }
        localStorage.setItem(LOCAL_STORAGE_LIKED_ADS_KEY, JSON.stringify(Array.from(likedIdsSet)));
      } catch (error) {
        console.error("Error updating liked EkoDrops in localStorage:", error);
      }
    }
  };
  
  const handleToggleDislike = (itemId: string) => {
    let itemWasDisliked: boolean | undefined;
    let itemTitle: string | undefined;

    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          itemWasDisliked = item.isDisliked;
          itemTitle = item.title;
          const newIsLiked = item.isLiked ? false : item.isLiked; 
          return { ...item, isDisliked: !item.isDisliked, isLiked: newIsLiked };
        }
        return item;
      })
    );
    
    if (itemTitle !== undefined && itemWasDisliked !== undefined) {
      const itemIsNowDisliked = !itemWasDisliked;
      recordInteraction(itemId, 'dislike');
      toast({ 
        title: itemIsNowDisliked ? "Disliked!" : "Dislike removed!", 
        description: itemIsNowDisliked ? `You disliked "${itemTitle}".` : `You removed dislike for "${itemTitle}".`
      });
    
      if (itemIsNowDisliked) {
        const item = feedItems.find(i => i.id === itemId);
         if (item && !item.isLiked) { 
            try {
                const storedLikedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_ADS_KEY) || '[]');
                const likedIdsSet = new Set<string>(storedLikedIds);
                if (likedIdsSet.has(itemId)) {
                    likedIdsSet.delete(itemId);
                    localStorage.setItem(LOCAL_STORAGE_LIKED_ADS_KEY, JSON.stringify(Array.from(likedIdsSet)));
                }
            } catch (error) {
                console.error("Error updating liked EkoDrops in localStorage after dislike:", error);
            }
         }
      }
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

  const handlePersonalizeFeed = async () => {
    let interactionsString = "User Interactions:\n";
    userInteractions.forEach(interaction => {
      const item = feedItems.find(i => i.id === interaction.itemId) || allAvailableAds.find(i => i.id === interaction.itemId);
      const itemName = item ? item.title : interaction.itemId;
      switch (interaction.interaction) {
        case 'like': interactionsString += `- Liked: ${itemName}\n`; break;
        case 'unlike': interactionsString += `- Unliked: ${itemName}\n`; break;
        case 'dislike': interactionsString += `- Disliked: ${itemName}\n`; break;
        case 'rate': interactionsString += `- Rated ${itemName} ${interaction.value} stars\n`; break;
        case 'followCategory': interactionsString += `- Followed Category: ${interaction.itemId}\n`; break;
        case 'unfollowCategory': interactionsString += `- Unfollowed Category: ${interaction.itemId}\n`; break;
      }
    });
    if (followedCategories.size > 0) {
        interactionsString += `Currently Following: ${Array.from(followedCategories).join(', ')}\n`;
    }

    const availableAdsString = "Available Ads/EkoDrops:\n" + allAvailableAds.map(ad => `- ${ad.transcript?.['en']?.substring(0,30) || ad.id} (Categories: ${ad.hashtags?.join(', ') || 'N/A'})`).join('\n');

    toast({ title: "AI Magic ✨", description: "Personalizing your EkoDrop feed..."});
    try {
      const result = await personalizeAdFeedDeepSeek({ 
        userPastInteractions: interactionsString || "No specific interactions yet.",
        availableAds: availableAdsString,
      });
      
      const newFeed = [...feedItems]; 
      for (let i = newFeed.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newFeed[i], newFeed[j]] = [newFeed[j], newFeed[i]];
      }
      const aiMentionedAdTitle = result.personalizedAdFeed.split(',')[0].trim(); 
      const aiMentionedAd = allAvailableAds.find(ad => (ad.transcript?.['en'] || ad.id).toLowerCase().includes(aiMentionedAdTitle.toLowerCase()));
      
      if (aiMentionedAd && !newFeed.find(item => item.id === aiMentionedAd.id)) {
        const mappedAd: FeedItemData = {
            id: aiMentionedAd.id, type: 'ad', audioUrl: aiMentionedAd.audioURL, videoUrl: aiMentionedAd.audioURL,
            title: aiMentionedAd.transcript?.['en']?.substring(0,50) || `EkoDrop ${aiMentionedAd.id}`,
            description: aiMentionedAd.transcript?.['en'] || `Audio by user ${aiMentionedAd.userId}`,
            categories: aiMentionedAd.hashtags || [], userRating: 0, isLiked: false, isDisliked: false,
            userId: aiMentionedAd.userId, duration: aiMentionedAd.duration, likesCount: aiMentionedAd.likes, createdAt: aiMentionedAd.createdAt,
            dataAiHint: 'voice audio', advertiser: aiMentionedAd.advertiserName,
        };
        newFeed.unshift(mappedAd); 
      }
      
      setFeedItems(newFeed.slice(0, initialFeedItems.length)); 
      toast({
        title: "AI Feed Personalization",
        description: "Feed updated. AI Output: " + result.personalizedAdFeed.substring(0, 100) + "...",
      });

    } catch (error) {
      console.error("Error personalizing feed:", error);
      toast({
        variant: "destructive",
        title: "AI Personalization Error",
        description: "Could not personalize feed. " + (error instanceof Error ? error.message : String(error)),
      });
    }
  };

  const handleSubscribe = async (sku: string) => {
    toast({ title: "Processing Subscription...", description: "Please wait." });
    try {
      let result = { success: false, message: "Bridge not found" };
      if (isAndroidApp && window.androidAppBridge?.subscribe) {
        console.log(`Attempting to subscribe via Android bridge with SKU: ${sku}`);
        result = await window.androidAppBridge.subscribe(sku); 
      } else if (isIOSApp && window.iosAppBridge?.subscribe) {
        console.log(`Attempting to subscribe via iOS bridge with SKU: ${sku}`);
        result = await window.iosAppBridge.subscribe(sku);
      } else {
        console.warn("Mobile bridge not found. Simulating subscription success for web.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = { success: true, message: "Simulated success" };
      }

      if (result.success) {
        setIsUserSubscribed(true);
        toast({ title: "Subscription Successful!", description: "You are now subscribed to Eko+." });
      } else {
        toast({ variant: "destructive", title: "Subscription Failed", description: result.message || "Could not complete subscription." });
      }
    } catch (error) {
      console.error("Error during subscription process via bridge:", error);
      toast({ variant: "destructive", title: "Subscription Error", description: "An error occurred." });
    }
  };

  const handlePurchaseProduct = async (sku: string, title: string) => {
     toast({ title: `Purchasing ${title}...`, description: "Please wait." }); 
     try {
      let result = { success: false, message: "Bridge not found" };
      if (isAndroidApp && window.androidAppBridge?.purchase) {
        console.log(`Attempting to purchase via Android bridge with SKU: ${sku}`);
        result = await window.androidAppBridge.purchase(sku);
      } else if (isIOSApp && window.iosAppBridge?.purchase) {
         console.log(`Attempting to purchase via iOS bridge with SKU: ${sku}`);
        result = await window.iosAppBridge.purchase(sku);
      } else {
        console.warn("Mobile bridge not found. Simulating purchase success for web.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = { success: true, message: "Simulated success" };
      }
      
      if (result.success) {
        toast({ title: "Purchase Successful!", description: `You have purchased ${title}.` }); 
      } else {
        toast({ variant: "destructive", title: "Purchase Failed", description: result.message || `Could not purchase ${title}.` }); 
      }
    } catch (error) {
      console.error(`Error during purchase process for SKU ${sku} via bridge:`, error);
      toast({ variant: "destructive", title: "Purchase Error", description: "An error occurred." });
    }
  };


  return (
    <div className="flex flex-col h-full">
      <AppHeader onPersonalize={handlePersonalizeFeed} />
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory">
        {(isAndroidApp || isIOSApp) && ( 
          <div className="p-4 border-b bg-card">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                  Eko+ & In-App Purchases
                </CardTitle>
                <CardDescription>Manage your Eko+ subscription and purchases.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-md font-semibold mb-1">Subscription Status:</h3>
                  <p className={isUserSubscribed ? "text-green-600" : "text-red-600"}>
                    {isUserSubscribed ? "Eko+ Active" : "Not Subscribed to Eko+"}
                  </p>
                </div>

                {!isUserSubscribed && (
                  <Button onClick={() => handleSubscribe(premiumSubscriptionSku)} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" /> Subscribe to Eko+
                  </Button>
                )}

                <div>
                  <h3 className="text-md font-semibold mt-4 mb-2">Available In-App Items:</h3>
                  <div className="space-y-3">
                    {availableIAPs.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center bg-background">
                        <div>
                          <p className="font-medium">{item.title}</p>
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
          <div className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
             <div className="w-full max-w-md mx-auto h-[calc(100%-80px)] md:h-[calc(100%-100px)] flex flex-col">
              <Skeleton className="aspect-square w-full rounded-t-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </div>
              <div className="p-4 border-t space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <div className="flex justify-around">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          feedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="h-full"> 
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
              {(index + 1) % 3 === 0 && process.env.NEXT_PUBLIC_ADMOB_BANNER_AD_UNIT_ID && (
                <div className="h-auto w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
                  <AdMobBanner />
                </div>
              )}
            </div>
          ))
        )}
         {feedItems.length === 0 && !isLoading && (
          <div className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
            <p className="text-muted-foreground">No EkoDrops in your feed yet. Record one!</p>
          </div>
        )}
      </main>
    </div>
  );
}
