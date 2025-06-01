
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
  privacy: {
    profile: PrivacySetting;
    defaultPostVisibility: PostVisibility;
  };
  language: SupportedLanguage; // User's preferred language for UI
  followersCount?: number; // Initialize to 0
  followingCount?: number; // Initialize to 0
  // Timestamps
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface EkoPost {
  id: string; // document ID is postId
  userId: string; // Reference to users/{userId}
  username: string; // Denormalized username for easier display
  userAvatarURL?: string; // Denormalized avatar for easier display
  audioURL?: string; // Firebase Storage reference - for future audio
  textContent: string; // Main text content of the EkoDrop
  waveform?: number[]; // FFT data for visualization
  transcription?: string; // Optional: server-generated transcription
  durationSeconds?: number;
  visibility: PostVisibility;
  hashtags?: string[];
  mentions?: string[]; // Array of userIds (usernames or UIDs)
  reEkoCount: number; // Initialize to 0
  commentCount: number; // Initialize to 0
  likeCount: number; // Initialize to 0
  // Timestamps
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Like {
  id?: string; // Firestore document ID
  userId: string; // User who liked
  postId: string; // Post that was liked
  createdAt: Timestamp;
}

export interface ReEko {
  id?: string; // Firestore document ID
  originalPostId: string; // Reference to posts/{postId}
  userId: string; // User who re-ekoed, Reference to users/{userId}
  username: string; // Denormalized username of re-ekoer
  userAvatarURL?: string; // Denormalized avatar of re-ekoer
  createdAt: Timestamp;
  // Optional: A re-eko could also have its own textContent if users can quote-tweet/re-eko with comment
  // textContent?: string;
}

export interface EkoComment {
  id?: string; // Firestore document ID
  postId: string; // Reference to posts/{postId}
  userId: string; // User who commented, Reference to users/{userId}
  username: string; // Denormalized username of commenter
  userAvatarURL?: string; // Denormalized avatar of commenter
  textContent?: string; // Text of the comment
  audioURL?: string; // Firebase Storage reference for voice comment
  durationSeconds?: number;
  waveform?: number[];
  createdAt: Timestamp;
  // Future: Add likeCount for comments, replies (parentId)
}

// Kept VoiceComment for potential future distinction, but EkoComment can serve both
export interface VoiceComment extends EkoComment {
  audioURL: string; // Firebase Storage reference
}


export interface Report {
  id?: string; // document ID
  reportedContentType: 'post' | 'comment' | 'user';
  reportedContentId: string; // ID of the post, comment, or user being reported
  reportingUserId: string; // User who submitted the report
  reason: 'spam' | 'abuse' | 'illegal_content' | 'hate_speech' | 'misinformation' | 'other'; // Extended reasons
  additionalComments?: string;
  status: 'pending' | 'reviewed_action_taken' | 'reviewed_no_action'; // Default to 'pending'
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewerId?: string; // Admin who reviewed
}

// For UI String Localization (as per BRD Firestore-backed i18n)
// This will be relevant when we implement the Firestore-backed i18n.
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
