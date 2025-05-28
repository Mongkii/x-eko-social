
"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FeedItemCard } from '@/components/feed-item-card';
import type { FeedItemData } from '@/lib/types';
import { allAvailableAds, initialFeedItems } from '@/lib/eko-data';
import { toast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ArrowLeft } from 'lucide-react';

const LOCAL_STORAGE_LIKED_EKO_DROPS_KEY = 'eko_liked_eko_drop_ids';

export default function SavedEkoDropsPage() {
  const [savedItems, setSavedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedLikedIds = localStorage.getItem(LOCAL_STORAGE_LIKED_EKO_DROPS_KEY);
    if (storedLikedIds) {
      const likedIds = new Set<string>(JSON.parse(storedLikedIds));
      const allItems = [...initialFeedItems, ...allAvailableAds]; // Assuming these are now EkoDrops
      const userSavedItems = allItems.filter(item => likedIds.has(item.id))
        .map(item => ({
          ...item,
          transcript: typeof item.transcript === 'object' ? (item.transcript as any).ar || item.transcript?.['en'] || "لا يوجد نص" : item.transcript || "لا يوجد نص",
          sourceLanguage: item.sourceLanguage || 'ar',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      setSavedItems(userSavedItems);
    }
    setIsLoading(false);
  }, []);

  const handleInteraction = (itemId: string, interactionType: 'like' | 'dislike' | 'unlike') => {
    const item = savedItems.find(i => i.id === itemId);
    if (!item) return;

    let newLikedSet = new Set<string>(JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKED_EKO_DROPS_KEY) || '[]'));

    if (interactionType === 'unlike' || interactionType === 'dislike') {
      newLikedSet.delete(itemId);
      setSavedItems(prevItems => prevItems.filter(i => i.id !== itemId));
      toast({
        title: interactionType === 'unlike' ? "إلغاء الإعجاب!" : "لم يعجبني!",
        description: `تمت إزالة "${item.title || 'إيكو دروب'}" من المحفوظات.`,
      });
    } else if (interactionType === 'like') {
      newLikedSet.add(itemId);
      toast({ title: "أعجبني!", description: `لقد أعجبك "${item.title || 'إيكو دروب'}".` });
    }
    localStorage.setItem(LOCAL_STORAGE_LIKED_EKO_DROPS_KEY, JSON.stringify(Array.from(newLikedSet)));
  };
  
  const handleToggleFollowCategory = (category: string, isFollowing: boolean) => {
    if (isFollowing) {
      toast({ title: "تم متابعة الفئة!", description: `أنت تتابع الآن "${category}".` });
    } else {
      toast({ title: "تم إلغاء متابعة الفئة!", description: `لقد ألغيت متابعة "${category}".` });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">جار التحميل...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onPersonalizeFeed={() => toast({ title: "معلومة", description: "تخصيص الخلاصة متاح في الصفحة الرئيسية."})}/>
      <main className="flex-grow container mx-auto py-4 px-2 md:px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إيكو دروبس المحفوظة</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
              العودة إلى الخلاصة
            </Link>
          </Button>
        </div>

        {savedItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            {savedItems.map(item => (
              <FeedItemCard
                key={item.id}
                item={item}
                isLiked={true}
                onInteraction={handleInteraction}
                onToggleFollowCategory={handleToggleFollowCategory}
                isPlaying={false}
                onPlayRequest={() => {}}
                onAudioEnded={() => {}}
                audioRef={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground mb-2">لم تقم بحفظ أي إيكو دروبس بعد.</p>
            <p className="text-md text-muted-foreground">أعجب بإيكو دروب في الخلاصة الرئيسية لحفظه هنا!</p>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

