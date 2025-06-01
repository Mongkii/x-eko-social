
import type { Timestamp } from 'firebase/firestore';

// As per BRD 2.0
export type PrivacySetting = 'public' | 'private';
export type PostVisibility = 'public' | 'followers-only' | 'private';
export type SupportedLanguage = 'en' | 'ar' | 'es' | 'ur' | 'fr' | 'de' | 'hi' | 'zh' | 'tl'; // BRD mentions 9 languages

export interface UserProfile {
  id: string; // document ID is userId
  username: string;
  bio?: string;
  avatarURL?: string;
  privacy: {
    profile: PrivacySetting;
    defaultPostVisibility: PostVisibility;
  };
  language: SupportedLanguage; // User's preferred language for UI
  followersCount?: number;
  followingCount?: number;
  // Timestamps
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface EkoPost {
  id: string; // document ID is postId
  userId: string; // Reference to users/{userId}
  audioURL: string; // Firebase Storage reference
  waveform?: number[]; // FFT data for visualization
  transcription?: string; // Optional: server-generated transcription
  durationSeconds?: number;
  visibility: PostVisibility;
  hashtags?: string[];
  mentions?: string[]; // Array of userIds
  reEkoCount?: number;
  commentCount?: number;
  likeCount?: number;
  // Timestamps
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReEko {
  id: string; // document ID
  originalPostId: string; // Reference to posts/{postId}
  userId: string; // User who re-ekoed, Reference to users/{userId}
  createdAt: Timestamp;
}

export interface VoiceComment {
  id: string; // document ID
  postId: string; // Reference to posts/{postId}
  userId: string; // User who commented, Reference to users/{userId}
  audioURL: string; // Firebase Storage reference
  durationSeconds?: number;
  waveform?: number[];
  createdAt: Timestamp;
}

export interface Report {
  id: string; // document ID
  reportedContentType: 'post' | 'comment' | 'user';
  reportedContentId: string; // ID of the post, comment, or user being reported
  reportingUserId: string; // User who submitted the report
  reason: 'spam' | 'abuse' | 'illegal_content' | 'hate_speech' | 'misinformation' | 'other';
  additionalComments?: string;
  status?: 'pending' | 'reviewed_action_taken' | 'reviewed_no_action';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewerId?: string; // Admin who reviewed
}

// For UI String Localization (as per BRD Firestore-backed i18n)
export interface LocalizationStrings {
  [key: string]: string | LocalizationStrings; // Allows nested strings
}

// Ad types for AdMob integration
export type AdType = 
  | 'FEED_NATIVE'
  | 'PROFILE_BANNER'
  | 'POST_INTERSTITIAL'
  | 'RE_EKO_REWARDED'
  | 'SEARCH_BANNER';

// Example for a generic list item, can be adapted
export interface ListItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}
