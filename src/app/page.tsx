"use client";

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { FeedItemCard } from '@/components/feed-item-card';
import { FeedItemData, UserInteraction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { personalizeAdFeed } from '@/ai/flows/personalize-ad-feed'; // GenAI flow
import { useToast } from '@/hooks/use-toast';

const initialFeedItems: FeedItemData[] = [
  { id: '1', type: 'content', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'travel landscape', title: 'Amazing Mountain View', description: 'Exploring the serene beauty of the mountains.', categories: ['Travel', 'Nature'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '2', type: 'ad', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'fashion clothing', title: 'New Summer Collection!', advertiser: 'FashionBrandX', description: 'Get ready for summer with our new arrivals. Up to 50% off!', categories: ['Fashion', 'Shopping'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '3', type: 'content', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'food recipe', title: 'Delicious Pasta Recipe', description: 'Learn how to make this simple and tasty pasta dish.', categories: ['Food', 'Cooking'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '4', type: 'ad', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'electronics gadget', title: 'Latest Smartphone Pro', advertiser: 'TechGiant', description: 'Experience the future with the new Smartphone Pro. Pre-order now!', categories: ['Electronics', 'Tech'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '5', type: 'content', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'sports game', title: 'Epic Soccer Match Highlights', description: 'Relive the best moments from yesterday\'s game.', categories: ['Sports', 'Soccer'], userRating: 0, isLiked: false, isDisliked: false },
];

// Mock list of all available ads for personalization
const allAvailableAds: FeedItemData[] = [
  ...initialFeedItems.filter(item => item.type === 'ad'),
  { id: 'ad101', type: 'ad', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'gaming console', title: 'Next-Gen Gaming Console', advertiser: 'GameWorld', description: 'Immerse yourself in ultra-realistic gaming.', categories: ['Gaming', 'Electronics'], userRating: 0, isLiked: false, isDisliked: false },
  { id: 'ad102', type: 'ad', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'travel destination', title: 'Dream Vacation Package', advertiser: 'TravelDreams', description: 'Book your dream vacation today at an unbeatable price.', categories: ['Travel', 'Deals'], userRating: 0, isLiked: false, isDisliked: false },
  { id: 'ad103', type: 'ad', sourceUrl: 'https://placehold.co/360x640.png', dataAiHint: 'food delivery', title: 'Quick Food Delivery', advertiser: 'SpeedyEats', description: 'Hungry? Get your favorite meals delivered in minutes.', categories: ['Food', 'Services'], userRating: 0, isLiked: false, isDisliked: false },
];


export default function HomePage() {
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedCategories, setFollowedCategories] = useState<Set<string>>(new Set(['Travel']));
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setFeedItems(initialFeedItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  const recordInteraction = useCallback((itemId: string, interaction: UserInteraction['interaction'], value?: string | number) => {
    setUserInteractions(prev => [...prev, { itemId, interaction, value, timestamp: new Date() }]);
  }, []);

  const handleRate = (itemId: string, rating: number) => {
    setFeedItems(prevItems =>
      prevItems.map(item => (item.id === itemId ? { ...item, userRating: rating } : item))
    );
    recordInteraction(itemId, 'rate', rating);
    toast({ title: "Rating submitted!", description: `You rated "${feedItems.find(i=>i.id===itemId)?.title}" ${rating} stars.` });
  };

  const handleToggleLike = (itemId: string) => {
    setFeedItems(prevItems =>
      prevItems.map(item => (item.id === itemId ? { ...item, isLiked: !item.isLiked, isDisliked: false } : item))
    );
    const item = feedItems.find(i=>i.id===itemId);
    if (item) {
      recordInteraction(itemId, 'like');
      toast({ title: item.isLiked ? "Unliked!" : "Liked!", description: `You ${item.isLiked ? "unliked" : "liked"} "${item.title}".`});
    }
  };

  const handleToggleDislike = (itemId: string) => {
    setFeedItems(prevItems =>
      prevItems.map(item => (item.id === itemId ? { ...item, isDisliked: !item.isDisliked, isLiked: false } : item))
    );
    const item = feedItems.find(i=>i.id===itemId);
    if (item) {
      recordInteraction(itemId, 'dislike');
      toast({ title: item.isDisliked ? "Dislike removed!" : "Disliked!", description: `You ${item.isDisliked ? "removed dislike for" : "disliked"} "${item.title}".`});
    }
  };

  const handleToggleFollowCategory = (category: string) => {
    setFollowedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
        recordInteraction(category, 'unfollowCategory');
        toast({ title: "Unfollowed Category!", description: `You unfollowed "${category}".`});
      } else {
        newSet.add(category);
        recordInteraction(category, 'followCategory');
        toast({ title: "Followed Category!", description: `You are now following "${category}".`});
      }
      return newSet;
    });
  };

  const handlePersonalizeFeed = async () => {
    // 1. Construct userPastInteractions string
    let interactionsString = "User Interactions:\n";
    userInteractions.forEach(interaction => {
      const item = feedItems.find(i => i.id === interaction.itemId) || allAvailableAds.find(i => i.id === interaction.itemId);
      const itemName = item ? item.title : interaction.itemId;
      switch (interaction.interaction) {
        case 'like': interactionsString += `- Liked: ${itemName}\n`; break;
        case 'dislike': interactionsString += `- Disliked: ${itemName}\n`; break;
        case 'rate': interactionsString += `- Rated ${itemName} ${interaction.value} stars\n`; break;
        case 'followCategory': interactionsString += `- Followed Category: ${interaction.itemId}\n`; break;
        case 'unfollowCategory': interactionsString += `- Unfollowed Category: ${interaction.itemId}\n`; break;
      }
    });
    if (followedCategories.size > 0) {
        interactionsString += `Currently Following: ${Array.from(followedCategories).join(', ')}\n`;
    }


    // 2. Construct availableAds string
    const availableAdsString = "Available Ads:\n" + allAvailableAds.map(ad => `- ${ad.title} (Categories: ${ad.categories.join(', ')})`).join('\n');

    try {
      const result = await personalizeAdFeed({
        userPastInteractions: interactionsString || "No specific interactions yet.",
        availableAds: availableAdsString,
      });
      
      // Simulate updating feed based on AI response
      // In a real app, you'd parse result.personalizedAdFeed and fetch/reorder ads.
      // For this demo, we'll shuffle existing ads and maybe add one new one if mentioned.
      const newFeed = [...feedItems];
      // Simple shuffle for demo
      for (let i = newFeed.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newFeed[i], newFeed[j]] = [newFeed[j], newFeed[i]];
      }
      // Try to find an ad from AI output to highlight (very basic)
      const aiMentionedAd = allAvailableAds.find(ad => result.personalizedAdFeed.toLowerCase().includes(ad.title.toLowerCase()));
      if (aiMentionedAd && !newFeed.find(item => item.id === aiMentionedAd.id)) {
        newFeed.unshift(aiMentionedAd); // Add to top
      }
      
      setFeedItems(newFeed.slice(0, initialFeedItems.length)); // Keep feed length consistent for demo
      toast({
        title: "AI Feed Personalization (Simulated)",
        description: "Feed updated based on AI suggestions. AI Output: " + result.personalizedAdFeed.substring(0, 100) + "...",
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


  return (
    <div className="flex flex-col h-full">
      <AppHeader onPersonalize={handlePersonalizeFeed} />
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory">
        {isLoading ? (
          <div className="h-full w-full flex-shrink-0 snap-start relative overflow-hidden flex items-center justify-center p-4">
             <div className="w-full max-w-md mx-auto h-[calc(100%-80px)] md:h-[calc(100%-100px)] flex flex-col">
              <Skeleton className="aspect-[9/16] w-full rounded-t-lg" />
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
            <FeedItemCard
              key={`${item.id}-${index}`} // Add index to key if IDs might not be unique after shuffle
              item={item}
              followedCategories={followedCategories}
              onRate={handleRate}
              onToggleLike={handleToggleLike}
              onToggleDislike={handleToggleDislike}
              onToggleFollowCategory={handleToggleFollowCategory}
            />
          ))
        )}
      </main>
    </div>
  );
}
