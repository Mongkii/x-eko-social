
import type { AbstractIntlMessages } from 'next-intl';

// Corresponds to Firestore posts/{postId} as per BRD
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
  createdAt: any; // Firestore Timestamp or ISO string for web simulation
  updatedAt?: any; // Firestore Timestamp or ISO string
  // Fields for ad-specific data if this EkoDrop is a native ad
  isAd?: boolean;
  advertiserName?: string;
  adClickURL?: string;
  adTargetingInfo?: Record<string, any>; // For analytics or specific ad logic
}

// UI data structure, derived from EkoDrop for feed display
export interface FeedItemData extends EkoDrop {
  // Additional UI-specific fields if needed, but mostly maps to EkoDrop
  posterUrl?: string; // Optional poster image for the audio
  dataAiHint?: string; // For placeholder images if posterUrl is missing
  userRating?: number; // Client-side rating
  isLiked?: boolean; // Client-side like status
  isDisliked?: boolean; // Client-side dislike status
}

export type InteractionType = 'like' | 'unlike' | 'dislike' | 'rate' | 'followCategory' | 'unfollowCategory' | 'play' | 'pause' | 'ended';

export interface UserInteraction {
  itemId: string;
  interaction: InteractionType;
  value?: string | number; // category name or rating value
  timestamp: Date;
}

// Corresponds to Firestore users/{userId} as per BRD
export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSizePreference = 'sm' | 'md' | 'lg';

export interface EkoUser {
  id: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: any; // Firestore Timestamp or ISO string
  themePreference?: ThemePreference;
  fontSizePreference?: FontSizePreference;
  isEkoPlusSubscriber?: boolean;
  ekoPlusSubscriptionExpiry?: any; // Firestore Timestamp or ISO string
  adInteractionCount?: {
    interstitialLastHour: number;
    lastInterstitialTimestamp?: any; // Firestore Timestamp or ISO string
  };
  adFreeMinutesRemaining?: number;
  lastRewardedAdTimestamp?: any; // Firestore Timestamp or ISO string
  followedTopics?: string[];
  blockedUsers?: string[];
}

export interface InAppPurchaseItem {
  id: string; // SKU
  title: string;
  description: string;
  price: string;
  type: 'subscription' | 'one-time';
}

// For next-intl messages
export interface Messages extends AbstractIntlMessages {}
