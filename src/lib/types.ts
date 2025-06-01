
import type { Timestamp } from 'firebase/firestore';

// As per BRD 2.0
export type PrivacySetting = 'public' | 'private';
export type PostVisibility = 'public' | 'followers-only' | 'private';
// BRD mentions 9 languages, simplifying to 'en' as default for now.
export type SupportedLanguage = 'en' | 'ar' | 'es' | 'ur' | 'fr' | 'de' | 'hi' | 'zh' | 'tl';

export interface UserProfile {
  id: string; // document ID is userId (Firebase Auth UID)
  username: string;
  username_lowercase: string; // For case-insensitive queries
  email: string; // Added for clarity, from Firebase Auth
  bio?: string;
  avatarURL?: string;
  coverImageURL?: string;
  privacy: {
    profile: PrivacySetting;
    defaultPostVisibility: PostVisibility;
  };
  language: SupportedLanguage; // User's preferred language for UI
  followersCount: number; // Initialize to 0
  followingCount: number; // Initialize to 0
  // Timestamps
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface EkoPost {
  id: string; // document ID is postId
  userId: string; // Reference to users/{userId}
  username: string; // Denormalized username for easier display
  userAvatarURL?: string; // Denormalized avatar for easier display
  audioURL?: string;
  textContent: string;
  waveform?: number[];
  transcription?: string;
  durationSeconds?: number;
  visibility: PostVisibility;
  hashtags?: string[]; // Extracted hashtags for querying/filtering
  mentions?: string[];
  reEkoCount: number;
  commentCount: number;
  likeCount: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Like {
  id?: string;
  userId: string;
  postId: string;
  createdAt: Timestamp;
}

export interface ReEko {
  id?: string;
  originalPostId: string;
  userId: string;
  username: string;
  userAvatarURL?: string;
  createdAt: Timestamp;
}

export interface EkoComment {
  id?: string;
  postId: string;
  userId: string;
  username: string;
  userAvatarURL?: string;
  textContent?: string;
  audioURL?: string;
  durationSeconds?: number;
  waveform?: number[];
  createdAt: Timestamp;
}

export interface VoiceComment extends EkoComment {
  audioURL: string;
}

export interface Report {
  id?: string;
  reportedContentType: 'post' | 'comment' | 'user';
  reportedContentId: string;
  reportingUserId: string;
  reason: 'spam' | 'abuse' | 'illegal_content' | 'hate_speech' | 'misinformation' | 'other';
  additionalComments?: string;
  status: 'pending' | 'reviewed_action_taken' | 'reviewed_no_action';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewerId?: string;
}

// For user follows
export interface Follow {
  id?: string; // Firestore document ID
  followerId: string; // User ID of the person initiating the follow
  followingId: string; // User ID of the person being followed
  createdAt: Timestamp;
}


export interface LocalizationStrings {
  [key: string]: string | LocalizationStrings;
}

export type AdType =
  | 'FEED_NATIVE'
  | 'PROFILE_BANNER'
  | 'POST_INTERSTITIAL'
  | 'RE_EKO_REWARDED'
  | 'SEARCH_BANNER';

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}
