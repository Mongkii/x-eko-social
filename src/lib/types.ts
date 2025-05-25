
// Corresponds to Firestore posts/{postId}
export interface EkoDrop {
  id: string;
  audioURL: string; // Firebase Cloud Storage path to compressed audio (e.g., Opus)
  rawAudioURL?: string; // Optional: path to raw audio if needed for reprocessing
  duration: number; // in seconds
  userId: string; // ID of the user who posted
  transcript?: { // Translated transcripts
    [key: string]: string; // e.g., { en: "Hello", ar: "مرحبا", ... }
  };
  sourceLanguage?: string; // Original language of the EkoDrop, e.g., 'en'
  hashtags?: string[];
  likes: number;
  replyCount?: number;
  repostCount?: number;
  parentId?: string | null; // For threaded replies
  topicId?: string | null; // If EkoDrops can belong to topics/channels
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  // Fields for ad-specific data if this EkoDrop is a native ad
  isAd?: boolean;
  advertiserName?: string;
  adClickURL?: string;
  adTargetingInfo?: Record<string, any>; // For analytics or specific ad logic
}

// For UI display, often derived from EkoDrop
export interface FeedItemData {
  id: string;
  type: 'ad' | 'content'; // 'content' for regular EkoDrops, 'ad' for native/sponsored
  audioUrl: string; // Renamed from sourceUrl to be specific for audio
  videoUrl?: string; // Kept for consistency, though BRD focuses on voice. Could be poster.
  posterUrl?: string; // Image to show before audio plays or if it's an image ad
  dataAiHint: string; // For placeholder image generation if needed
  title: string; // Could be derived from transcript, or a user-set title
  description: string; // Could be first few lines of transcript or a summary
  categories: string[]; // Corresponds to hashtags or topics
  userRating: number; // User's rating of the content/ad (0-5)
  isLiked: boolean;
  isDisliked: boolean;
  
  // Fields from EkoDrop
  userId: string;
  duration: number;
  transcript?: { [key: string]: string };
  sourceLanguage?: string;
  hashtags?: string[];
  likesCount: number;
  createdAt: any; // Firestore Timestamp

  // Ad specific fields
  advertiser?: string; // For ads, maps to advertiserName
}

export type InteractionType = 'like' | 'unlike' | 'dislike' | 'rate' | 'followCategory' | 'unfollowCategory' | 'play' | 'pause' | 'ended';

export interface UserInteraction {
  itemId: string;
  interaction: InteractionType;
  value?: string | number; // category name or rating value
  timestamp: Date;
}

export interface InAppPurchaseItem {
  id: string; // SKU (e.g., 'eko_plus_monthly', 'ad_free_permanent')
  title: string;
  description: string;
  price: string; // e.g., "$0.99"
  type: 'subscription' | 'one-time';
}

// Corresponds to Firestore users/{userId}
export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSizePreference = 'sm' | 'md' | 'lg';

export interface EkoUser {
  id: string;
  displayName?: string;
  photoURL?: string;
  email?: string; // If email auth is used
  phoneNumber?: string; // If phone auth is used
  createdAt: any; // Firestore Timestamp
  themePreference?: ThemePreference;
  fontSizePreference?: FontSizePreference;
  isEkoPlusSubscriber?: boolean;
  ekoPlusSubscriptionExpiry?: any; // Firestore Timestamp
  // Ad-related user data from BRD
  adInteractionCount?: {
    interstitialLastHour: number;
    lastInterstitialTimestamp?: any; // Firestore Timestamp
  };
  adFreeMinutesRemaining?: number;
  lastRewardedAdTimestamp?: any; // Firestore Timestamp
  followedTopics?: string[];
  blockedUsers?: string[];
}
