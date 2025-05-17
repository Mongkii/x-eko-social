
"use client";

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData, UserInteraction, InAppPurchaseItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { personalizeAdFeed } from '@/ai/flows/personalize-ad-feed';
import { useToast } from '@/hooks/use-toast';
import { initialFeedItems, allAvailableAds } from '@/lib/ads-data';
import { AdMobBanner } from '@/components/admob-banner';
import { mockInAppPurchaseItems, premiumSubscriptionSku } from '@/lib/billing-data';
import { CheckCircle, ShoppingCart, Star } from 'lucide-react';

const LOCAL_STORAGE_LIKED_ADS_KEY = 'shopyme_liked_ad_ids';

// Define the structure of the Android bridge for TypeScript
interface AndroidAppBridge {
  subscribe: (sku: string) => Promise<{ success: boolean; message?: string }>;
  purchase: (sku: string) => Promise<{ success: boolean; message?: string }>;
  // In a real app, these would likely be async or take callbacks
  getSubscriptionStatus: () => Promise<boolean>;
  getAvailableIaps: () => Promise<InAppPurchaseItem[]>;
}

declare global {
  interface Window {
    androidAppBridge?: AndroidAppBridge;
    // For native to update webview
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
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [availableIAPs, setAvailableIAPs] = useState<InAppPurchaseItem[]>(mockInAppPurchaseItems); // Default to mock


  useEffect(() => {
    // Simulate checking for Android bridge and initial state loading
    const bridge = window.androidAppBridge;
    if (bridge && typeof bridge.getSubscriptionStatus === 'function' && typeof bridge.getAvailableIaps === 'function') {
      setIsAndroidApp(true);
      bridge.getSubscriptionStatus()
        .then(status => setIsUserSubscribed(status))
        .catch(err => console.error("Error getting subscription status from bridge:", err));
      
      // In a real app, you might fetch IAPs from the bridge
      // For this simulation, we'll stick to mockIAPItems, or you could fetch them:
      // bridge.getAvailableIaps()
      //   .then(iaps => setAvailableIAPs(iaps))
      //   .catch(err => {
      //     console.error("Error getting IAPs from bridge, using mock data:", err);
      //     setAvailableIAPs(mockInAppPurchaseItems);
      //   });
      setAvailableIAPs(mockInAppPurchaseItems); // Keep using mock for this demo

      // Allow native code to update subscription status
      window.updateSubscriptionStatus = (newStatus: boolean) => {
        setIsUserSubscribed(newStatus);
        toast({
          title: "Subscription Updated",
          description: `Your subscription status is now: ${newStatus ? 'Active' : 'Inactive'}.`,
        });
      };

    } else {
      setIsAndroidApp(false); // Default to false if bridge is not found
      // To test UI in browser:
      // setIsAndroidApp(true); 
      // setIsUserSubscribed(false);
      // setAvailableIAPs(mockInAppPurchaseItems);
      console.warn("Android bridge 'androidAppBridge' not found. Play Billing UI will be conditional or use defaults.");
    }
    // Cleanup
    return () => {
      if (window.androidAppBridge) {
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
      console.error("Error reading liked ads from localStorage:", error);
    }

    const updatedInitialFeed = initialFeedItems.map(item => ({
      ...item,
      isLiked: item.type === 'ad' ? likedIdsSet.has(item.id) : item.isLiked,
    }));

    setFeedItems(updatedInitialFeed);
    setIsLoading(false);
  }, []);

  const recordInteraction = useCallback((itemId: string, interaction: UserInteraction['interaction'], value?: string | number) => {
    setUserInteractions(prev => [...prev, { itemId, interaction, value, timestamp: new Date() }]);
  }, []);

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
    let itemType: 'ad' | 'content' | undefined;

    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          itemWasLiked = item.isLiked;
          itemTitle = item.title;
          itemType = item.type;
          return { ...item, isLiked: !item.isLiked, isDisliked: false };
        }
        return item;
      })
    );

    if (itemTitle !== undefined && itemWasLiked !== undefined) {
      const itemIsNowLiked = !itemWasLiked;
      recordInteraction(itemId, itemIsNowLiked ? 'like' : 'unlike');
      toast({ title: itemIsNowLiked ? "Liked!" : "Unliked!", description: `You ${itemIsNowLiked ? "liked" : "unliked"} "${itemTitle}".`});

      if (itemType === 'ad') {
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
          console.error("Error updating liked ads in localStorage:", error);
        }
      }
    }
  };

  const handleToggleDislike = (itemId: string) => {
    let itemWasDisliked: boolean | undefined;
    let itemTitle: string | undefined;
     let itemType: 'ad' | 'content' | undefined;

    setFeedItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          itemWasDisliked = item.isDisliked;
          itemTitle = item.title;
          itemType = item.type;
          const newIsLiked = item.isLiked ? false : item.isLiked;
          return { ...item, isDisliked: !item.isDisliked, isLiked: newIsLiked };
        }
        return item;
      })
    );
    
    if (itemTitle !== undefined && itemWasDisliked !== undefined) {
      const itemIsNowDisliked = !itemWasDisliked;
      recordInteraction(itemId, 'dislike');
      toast({ title: itemIsNowDisliked ? "Disliked!" : "Dislike removed!", description: `You ${itemIsNowDisliked ? "disliked" : "removed dislike for"} "${itemTitle}".`});
    
      if (itemIsNowDisliked && itemType === 'ad') {
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
                console.error("Error updating liked ads in localStorage after dislike:", error);
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
      toast({ title: isNowFollowing ? "Followed Category!" : "Unfollowed Category!", description: `You ${isNowFollowing ? "are now following" : "unfollowed"} "${category}".`});
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

    const availableAdsString = "Available Ads:\n" + allAvailableAds.map(ad => `- ${ad.title} (Categories: ${ad.categories.join(', ')})`).join('\n');

    toast({ title: "AI Magic ✨", description: "Personalizing your ad feed..."});
    try {
      const result = await personalizeAdFeed({
        userPastInteractions: interactionsString || "No specific interactions yet.",
        availableAds: availableAdsString,
      });
      
      const newFeed = [...feedItems];
      for (let i = newFeed.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newFeed[i], newFeed[j]] = [newFeed[j], newFeed[i]];
      }
      const aiMentionedAd = allAvailableAds.find(ad => result.personalizedAdFeed.toLowerCase().includes(ad.title.toLowerCase()));
      if (aiMentionedAd && !newFeed.find(item => item.id === aiMentionedAd.id)) {
        newFeed.unshift({...aiMentionedAd, isLiked: false, isDisliked: false, userRating: 0}); 
      }
      
      setFeedItems(newFeed.slice(0, initialFeedItems.length));
      toast({
        title: "AI Feed Personalization (Simulated)",
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
    if (window.androidAppBridge && typeof window.androidAppBridge.subscribe === 'function') {
      console.log(`Attempting to subscribe via Android bridge with SKU: ${sku}`);
      toast({ title: "Processing Subscription...", description: "Please wait." });
      try {
        // const result = await window.androidAppBridge.subscribe(sku); // Real call
        // For simulation:
        const result = await new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({success: true}), 1000));

        if (result.success) {
          setIsUserSubscribed(true);
          toast({ title: "Subscription Successful!", description: "You are now subscribed to Premium." });
        } else {
          toast({ variant: "destructive", title: "Subscription Failed", description: "Could not complete subscription." });
        }
      } catch (error) {
        console.error("Error during subscription process via bridge:", error);
        toast({ variant: "destructive", title: "Subscription Error", description: "An error occurred." });
      }
    } else {
      toast({ variant: "destructive", title: "Android Bridge Not Found", description: "Subscription feature only available in the Android app." });
      // Simulate for browser testing
      // setIsUserSubscribed(true);
      // toast({ title: "Subscription Successful! (Simulated)", description: "You are now subscribed to Premium." });
    }
  };

  const handlePurchaseProduct = async (sku: string, title: string) => {
     if (window.androidAppBridge && typeof window.androidAppBridge.purchase === 'function') {
      console.log(`Attempting to purchase via Android bridge with SKU: ${sku}`);
      toast({ title: `Purchasing ${title}...`, description: "Please wait." });
      try {
        // const result = await window.androidAppBridge.purchase(sku); // Real call
        // For simulation:
        const result = await new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({success: true}), 1000));

        if (result.success) {
          toast({ title: "Purchase Successful!", description: `You have purchased ${title}.` });
          // If this purchase grants subscription, update state:
          // if (sku === premiumSubscriptionSku) setIsUserSubscribed(true);
        } else {
          toast({ variant: "destructive", title: "Purchase Failed", description: `Could not purchase ${title}.` });
        }
      } catch (error) {
        console.error(`Error during purchase process for SKU ${sku} via bridge:`, error);
        toast({ variant: "destructive", title: "Purchase Error", description: "An error occurred." });
      }
    } else {
      toast({ variant: "destructive", title: "Android Bridge Not Found", description: "Purchase feature only available in the Android app." });
      // Simulate for browser testing
      // toast({ title: `Purchase Successful! (Simulated)`, description: `You have purchased ${title}.` });
    }
  };


  return (
    <div className="flex flex-col h-full">
      <AppHeader onPersonalize={handlePersonalizeFeed} />
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory">
        {isAndroidApp && (
          <div className="p-4 border-b bg-card">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                  App Subscriptions & Purchases
                </CardTitle>
                <CardDescription>Manage your subscriptions and in-app items (Simulated for Android App).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-md font-semibold mb-1">Subscription Status:</h3>
                  <p className={isUserSubscribed ? "text-green-600" : "text-red-600"}>
                    {isUserSubscribed ? "Premium Active" : "Not Subscribed"}
                  </p>
                </div>

                {!isUserSubscribed && (
                  <Button onClick={() => handleSubscribe(premiumSubscriptionSku)} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" /> Subscribe to Premium
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
            <div key={`${item.id}-${index}`}>
              <FeedItemCard
                item={item}
                followedCategories={followedCategories}
                onRate={handleRate}
                onToggleLike={handleToggleLike}
                onToggleDislike={handleToggleDislike}
                onToggleFollowCategory={handleToggleFollowCategory}
              />
              {(index + 1) % 3 === 0 && process.env.NEXT_PUBLIC_ADMOB_BANNER_AD_UNIT_ID && (
                <div className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
                  <AdMobBanner />
                </div>
              )}
            </div>
          ))
        )}
         {feedItems.length === 0 && !isLoading && (
          <div className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
            <p className="text-muted-foreground">No items in your feed yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
