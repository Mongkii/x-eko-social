
"use client";

import type { FeedItemData, InAppPurchaseItem } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { FeedItemCard } from '@/components/feed-item-card';
import { AdMobBanner } from '@/components/admob-banner';
import { Button } from "@/components/ui/button";
import { initialFeedItems, allAvailableAds } from '@/lib/eko-data'; // Using eko-data
import { mockInAppPurchaseItems, premiumSubscriptionSku } from '@/lib/billing-data';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef, useCallback } from 'react';

const LOCAL_STORAGE_LIKED_EKO_DROPS_KEY = 'eko_liked_eko_drop_ids';

// Simulated Android/iOS bridge interface
declare global {
  interface Window {
    androidAppBridge?: {
      subscribe: (sku: string) => void;
      purchase: (sku: string) => void;
      getSubscriptionStatus: () => Promise<boolean>;
      // Potentially other methods
    };
    iosAppBridge?: {
      subscribe: (sku: string) => void;
      purchase: (sku: string) => void;
      getSubscriptionStatus: () => Promise<boolean>;
      // Potentially other methods
    };
    updateSubscriptionStatus?: (isSubscribed: boolean) => void;
  }
}


export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [likedEkoDrops, setLikedEkoDrops] = useState<Set<string>>(new Set());
  const [userInteractions, setUserInteractions] = useState<any[]>([]); // Simplified for now

  // Billing and Mobile App State
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [isIOSApp, setIsIOSApp] = useState(false);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);

  // Continuous Playback State
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());


  useEffect(() => {
    const loadedFeedItems = initialFeedItems.map(item => ({
      ...item,
      // Ensure transcript is always an object, default to Arabic if not present.
      transcript: typeof item.transcript === 'object' ? item.transcript : { ar: item.transcript || "لا يوجد نص" },
      sourceLanguage: item.sourceLanguage || 'ar',
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    setFeedItems(loadedFeedItems);

    const storedLikedAds = localStorage.getItem(LOCAL_STORAGE_LIKED_EKO_DROPS_KEY);
    if (storedLikedAds) {
      setLikedEkoDrops(new Set(JSON.parse(storedLikedAds)));
    }

    // Mobile bridge detection
    if (typeof window !== 'undefined') {
      if (window.androidAppBridge) {
        setIsAndroidApp(true);
        window.androidAppBridge.getSubscriptionStatus?.().then(setIsUserSubscribed).catch(console.error);
      } else if (window.webkit?.messageHandlers?.iosAppBridge || window.iosAppBridge) { // Common ways to detect iOS bridge
        setIsIOSApp(true);
         // Use window.iosAppBridge if directly available, else assume it's via messageHandlers
        const bridge = window.iosAppBridge || window.webkit?.messageHandlers?.iosAppBridge;
        // This assumes getSubscriptionStatus is callable. Actual iOS bridge might differ.
        // For simulation, let's assume a direct call or a promise-based one if possible.
        // As direct `getSubscriptionStatus` is complex for messageHandlers, we'll simulate it.
        // bridge.getSubscriptionStatus?.().then(setIsUserSubscribed).catch(console.error);
        // For now, let's assume it's false and can be updated via updateSubscriptionStatus
      }

      // Expose a function for native code to call to update subscription status
      window.updateSubscriptionStatus = (isSubscribed) => {
        setIsUserSubscribed(isSubscribed);
         toast({
          title: "تحديث الاشتراك",
          description: `حالة الاشتراك الآن: ${isSubscribed ? "نشط" : "غير نشط"}.`,
        });
      };
    }
  }, []);

  const saveLikedEkoDrops = (newLikedSet: Set<string>) => {
    setLikedEkoDrops(newLikedSet);
    localStorage.setItem(LOCAL_STORAGE_LIKED_EKO_DROPS_KEY, JSON.stringify(Array.from(newLikedSet)));
  };

  const handleInteraction = (itemId: string, interactionType: 'like' | 'dislike' | 'unlike') => {
    const item = feedItems.find(i => i.id === itemId);
    if (!item) return;

    const newLikedSet = new Set(likedEkoDrops);
    if (interactionType === 'like') {
      newLikedSet.add(itemId);
      toast({ title: "أعجبني!", description: `لقد أعجبك "${item.title || 'إيكو دروب'}".` });
    } else if (interactionType === 'unlike') {
      newLikedSet.delete(itemId);
      toast({ title: "إلغاء الإعجاب!", description: `لقد ألغيت إعجابك بـ "${item.title || 'إيكو دروب'}".` });
    } else if (interactionType === 'dislike') {
      newLikedSet.delete(itemId); // Disliking also unlikes
      toast({ title: "لم يعجبني!", description: `لم يعجبك "${item.title || 'إيكو دروب'}".` });
    }
    saveLikedEkoDrops(newLikedSet);

    setUserInteractions(prev => [...prev, { itemId, type: interactionType, timestamp: new Date() }]);
  };

  const handleToggleFollowCategory = (category: string, isFollowing: boolean) => {
    if (isFollowing) {
      toast({ title: "تم متابعة الفئة!", description: `أنت تتابع الآن "${category}".` });
    } else {
      toast({ title: "تم إلغاء متابعة الفئة!", description: `لقد ألغيت متابعة "${category}".` });
    }
  };

  const handlePersonalizeFeed = async () => {
    toast({
      title: "تخصيص الخلاصة (محاكاة)",
      description: "هذه الميزة ستستخدم الذكاء الاصطناعي لتخصيص خلاصتك (غير مفعّلة حاليًا).",
    });
  };

  const handlePlayRequest = (itemId: string) => {
    if (currentPlayingId && currentPlayingId !== itemId) {
      const currentAudioEl = audioRefs.current.get(currentPlayingId);
      currentAudioEl?.pause();
    }
    setCurrentPlayingId(itemId);
    const newAudioEl = audioRefs.current.get(itemId);
    newAudioEl?.play().catch(error => console.error("Error playing audio:", error));
  };

  const handleAudioEnded = useCallback((endedItemId: string) => {
    const currentIndex = feedItems.findIndex(item => item.id === endedItemId);
    if (currentIndex !== -1 && currentIndex < feedItems.length - 1) {
      const nextItem = feedItems[currentIndex + 1];
      if (nextItem) { // Ensure nextItem exists
        handlePlayRequest(nextItem.id);
      } else {
        setCurrentPlayingId(null); // No more items
      }
    } else {
      setCurrentPlayingId(null); // Last item ended or item not found
    }
  }, [feedItems]);


  // Simulated Billing Handlers
  const handleSubscribe = async () => {
    if (!isAndroidApp && !isIOSApp) {
      toast({ title: "خطأ", description: "هذه الميزة متاحة فقط في تطبيق الهاتف المحمول.", variant: "destructive" });
      return;
    }
    toast({ title: "جاري المعالجة...", description: "يرجى الانتظار." });
    // Simulate API call to native bridge
    if (isAndroidApp && window.androidAppBridge) {
      console.log(`Attempting to subscribe via Android bridge with SKU: ${premiumSubscriptionSku}`);
      window.androidAppBridge.subscribe(premiumSubscriptionSku);
      // In a real app, native code would call back window.updateSubscriptionStatus
      setTimeout(() => window.updateSubscriptionStatus?.(true), 2000); // Simulate success
    } else if (isIOSApp && (window.iosAppBridge || window.webkit?.messageHandlers?.iosAppBridge)) {
      const bridge = window.iosAppBridge || window.webkit?.messageHandlers?.iosAppBridge;
      console.log(`Attempting to subscribe via iOS bridge with SKU: ${premiumSubscriptionSku}`);
      // bridge.subscribe(premiumSubscriptionSku); // Actual call depends on iOS bridge implementation
      setTimeout(() => window.updateSubscriptionStatus?.(true), 2000); // Simulate success
    }
  };

  const handlePurchaseProduct = async (product: InAppPurchaseItem) => {
     if (!isAndroidApp && !isIOSApp) {
      toast({ title: "خطأ", description: "هذه الميزة متاحة فقط في تطبيق الهاتف المحمول.", variant: "destructive" });
      return;
    }
    toast({ title: `جاري شراء ${product.title_ar}...`, description: "يرجى الانتظار." });
    if (isAndroidApp && window.androidAppBridge) {
      console.log(`Attempting to purchase via Android bridge with SKU: ${product.sku}`);
      window.androidAppBridge.purchase(product.sku);
      setTimeout(() => toast({ title: "تم الشراء!", description: `لقد اشتريت ${product.title_ar}.` }), 2000); // Simulate success
    } else if (isIOSApp && (window.iosAppBridge || window.webkit?.messageHandlers?.iosAppBridge)) {
      const bridge = window.iosAppBridge || window.webkit?.messageHandlers?.iosAppBridge;
      console.log(`Attempting to purchase via iOS bridge with SKU: ${product.sku}`);
      // bridge.purchase(product.sku); // Actual call depends on iOS bridge implementation
      setTimeout(() => toast({ title: "تم الشراء!", description: `لقد اشتريت ${product.title_ar}.` }), 2000); // Simulate success
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onPersonalizeFeed={handlePersonalizeFeed} />
      <main className="flex-grow container mx-auto py-4 px-2 md:px-4">
        {(isAndroidApp || isIOSApp) && (
          <div className="mb-6 p-4 border rounded-lg shadow-md bg-card">
            <h2 className="text-xl font-semibold mb-2">اشتراكات التطبيق والمشتريات (محاكاة)</h2>
            <p className="text-sm text-muted-foreground mb-3">إدارة اشتراكك والحصول على ميزات إضافية!</p>
            <div className="mb-3">
              <span className="font-medium">حالة الاشتراك: </span>
              {isUserSubscribed ? (
                <span className="text-green-600 font-semibold flex items-center">
                  <CheckCircle className="h-5 w-5 mr-1 rtl:ml-1 rtl:mr-0" /> إيكو+ بريميوم مفعل
                </span>
              ) : (
                <span className="text-red-600">غير مشترك في إيكو+</span>
              )}
            </div>
            {!isUserSubscribed && (
              <Button onClick={handleSubscribe} className="w-full mb-4">
                <ShoppingCart className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" /> اشترك في إيكو+
              </Button>
            )}
            <div>
              <h3 className="font-semibold mb-2">العناصر المتاحة داخل التطبيق:</h3>
              <ul className="space-y-2">
                {mockInAppPurchaseItems.map((item) => (
                  <li key={item.sku} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.title_ar}</p>
                      <p className="text-xs text-muted-foreground">{item.description_ar} - {item.price}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePurchaseProduct(item)}>شراء</Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {feedItems.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد إيكو دروبس في خلاصتك بعد. استكشف أو أنشئ!</p>}
          {feedItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <FeedItemCard
                item={item}
                isLiked={likedEkoDrops.has(item.id)}
                onInteraction={handleInteraction}
                onToggleFollowCategory={handleToggleFollowCategory}
                isPlaying={currentPlayingId === item.id}
                onPlayRequest={() => handlePlayRequest(item.id)}
                onAudioEnded={() => handleAudioEnded(item.id)}
                audioRef={(el: HTMLVideoElement | null) => audioRefs.current.set(item.id, el)}
              />
              {(index + 1) % 3 === 0 && <AdMobBanner />}
            </React.Fragment>
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
