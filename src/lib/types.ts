
export interface FeedItemData {
  id: string;
  type: 'ad' | 'content';
  sourceUrl: string; // Image URL for placeholder, or video poster
  videoUrl?: string; // Optional: actual video URL for ads
  dataAiHint: string;
  title: string;
  advertiser?: string; // For ads
  description: string;
  categories: string[];
  userRating: number; // 0 if not rated, 1-5 if rated
  isLiked: boolean;
  isDisliked: boolean;
}

export type InteractionType = 'like' | 'unlike' | 'dislike' | 'rate' | 'followCategory' | 'unfollowCategory';

export interface UserInteraction {
  itemId: string;
  interaction: InteractionType;
  value?: string | number; // category name or rating value
  timestamp: Date;
}

export interface InAppPurchaseItem {
  id: string; // SKU
  title: string;
  description: string;
  price: string; // e.g., "$0.99"
  type: 'subscription' | 'one-time';
}
