
export interface FeedItemData {
  id: string;
  type: 'ad' | 'content';
  sourceUrl: string; // Image URL for placeholder
  videoUrl?: string; // Optional: actual video URL
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
