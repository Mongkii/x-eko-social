
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
import { useTranslations } from 'next-intl';

const LOCAL_STORAGE_LIKED_ADS_KEY = 'shopyme_liked_ad_ids';

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
  const t = useTranslations('HomePage');
  const tGlobal = useTranslations('Global');


  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [isIOSApp, setIsIOSApp] = useState(false);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [availableIAPs, setAvailableIAPs] = useState<InAppPurchaseItem[]>(mockInAppPurchaseItems);


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
          title: t('subscriptionUpdated'),
          description: t('subscriptionStatusNow', { status: newStatus ? t('statusActive') : t('statusInactive') }),
        });
      };
    } else {
      // To test UI in browser:
      // setIsAndroidApp(true); // or setIsIOSApp(true);
      // setIsUserSubscribed(false);
      // setAvailableIAPs(mockInAppPurchaseItems);
      console.warn("No mobile app bridge (Android or iOS) found. Play/App Store Billing UI will be conditional or use defaults.");
    }

    return () => {
      if (window.updateSubscriptionStatus) {
        delete window.updateSubscriptionStatus;
      }
    }
  }, [toast, t]);


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
      toast({ title: t('ratingSubmittedToastTitle'), description: t('ratingSubmittedToastDescription', { title: itemTitle, rating }) });
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
      toast({ 
        title: itemIsNowLiked ? t('likedToastTitle') : t('unlikedToastTitle'), 
        description: itemIsNowLiked ? t('likedToastDescription', {title: itemTitle}) : t('unlikedToastDescription', {title: itemTitle})
      });

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
      toast({ 
        title: itemIsNowDisliked ? t('dislikedToastTitle') : t('dislikeRemovedToastTitle'), 
        description: itemIsNowDisliked ? t('dislikedToastDescription', {title: itemTitle}) : t('dislikeRemovedToastDescription', {title: itemTitle})
      });
    
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
      toast({ 
        title: isNowFollowing ? t('followedCategoryToastTitle') : t('unfollowedCategoryToastTitle'), 
        description: isNowFollowing ? t('followedCategoryToastDescription', {category}) : t('unfollowedCategoryToastDescription', {category})
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

    const availableAdsString = "Available Ads:\n" + allAvailableAds.map(ad => `- ${ad.title} (Categories: ${ad.categories.join(', ')})`).join('\n');

    toast({ title: t('aiMagicToastTitle'), description: t('aiMagicToastDescription')});
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
        title: t('aiFeedPersonalizedToastTitle'),
        description: t('aiFeedPersonalizedToastDescription') + " " + result.personalizedAdFeed.substring(0, 100) + "...",
      });

    } catch (error) {
      console.error("Error personalizing feed:", error);
      toast({
        variant: "destructive",
        title: t('aiPersonalizationErrorToastTitle'),
        description: t('aiPersonalizationErrorToastDescription') + " " + (error instanceof Error ? error.message : String(error)),
      });
    }
  };

  const handleSubscribe = async (sku: string) => {
    toast({ title: t('processingSubscription'), description: t('pleaseWait') });
    try {
      let result = { success: false, message: "Bridge not found" };
      if (isAndroidApp && window.androidAppBridge && typeof window.androidAppBridge.subscribe === 'function') {
        console.log(`Attempting to subscribe via Android bridge with SKU: ${sku}`);
        result = await new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({success: true}), 1000)); // Simulated
      } else if (isIOSApp && window.iosAppBridge && typeof window.iosAppBridge.subscribe === 'function') {
        console.log(`Attempting to subscribe via iOS bridge with SKU: ${sku}`);
        result = await new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({success: true}), 1000)); // Simulated
      } else {
        toast({ variant: "destructive", title: t('mobileBridgeNotFound'), description: t('featureOnlyInMobileApp') });
        return;
      }

      if (result.success) {
        setIsUserSubscribed(true);
        toast({ title: t('subscriptionSuccessful'), description: t('youAreNowSubscribed') });
      } else {
        toast({ variant: "destructive", title: t('subscriptionFailed'), description: result.message || t('couldNotCompleteSubscription') });
      }
    } catch (error) {
      console.error("Error during subscription process via bridge:", error);
      toast({ variant: "destructive", title: t('subscriptionError'), description: "An error occurred." });
    }
  };

  const handlePurchaseProduct = async (sku: string, title: string) => {
     toast({ title: t('purchasingItem', {title}), description: t('pleaseWait') });
     try {
      let result = { success: false, message: "Bridge not found" };
      if (isAndroidApp && window.androidAppBridge && typeof window.androidAppBridge.purchase === 'function') {
        console.log(`Attempting to purchase via Android bridge with SKU: ${sku}`);
        result = await new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({success: true}), 1000)); // Simulated
      } else if (isIOSApp && window.iosAppBridge && typeof window.iosAppBridge.purchase === 'function') {
         console.log(`Attempting to purchase via iOS bridge with SKU: ${sku}`);
        result = await new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({success: true}), 1000)); // Simulated
      } else {
        toast({ variant: "destructive", title: t('mobileBridgeNotFound'), description: t('featureOnlyInMobileApp') });
        return;
      }
      
      if (result.success) {
        toast({ title: t('purchaseSuccessful'), description: t('youHavePurchasedItem', {title}) });
      } else {
        toast({ variant: "destructive", title: t('purchaseFailed'), description: result.message || t('couldNotPurchaseItem', {title}) });
      }
    } catch (error) {
      console.error(`Error during purchase process for SKU ${sku} via bridge:`, error);
      toast({ variant: "destructive", title: t('purchaseError'), description: "An error occurred." });
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
                  {t('billingSectionTitle')}
                </CardTitle>
                <CardDescription>{t('billingSectionDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-md font-semibold mb-1">{t('subscriptionStatus')}:</h3>
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
                  <h3 className="text-md font-semibold mt-4 mb-2">{t('availableInAppItems')}:</h3>
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
            <p className="text-muted-foreground">{t('noFeedItems')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
