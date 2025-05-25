
import {getRequestConfig, type AbstractIntlMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

// This object is used by RootLayout for NextIntlClientProvider
// It ensures all necessary keys are available for client components,
// especially if actual message loading fails.
export const minimalFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko (Fallback)",
    loading: "Loading...",
  },
  HomePage: {
    greeting: "Welcome to Eko (Fallback)",
    aiMagicToastTitle: "AI Magic ✨ (Fallback)",
    aiMagicToastDescription: "Personalizing your feed... (Fallback)",
    aiPersonalizationErrorToastTitle: "AI Personalization Error (Fallback)",
    aiPersonalizationErrorToastDescription: "Could not personalize feed. (Fallback)",
    aiFeedPersonalizedToastTitle: "AI Feed Personalized (Fallback)",
    aiFeedPersonalizedToastDescription: "Feed updated. (Fallback)",
    ratingSubmittedToastTitle: "Rating submitted! (Fallback)",
    ratingSubmittedToastDescription: "You rated \"{title}\" {rating} stars. (Fallback)",
    likedToastTitle: "Liked! (Fallback)",
    likedToastDescription: "You liked \"{title}\". (Fallback)",
    unlikedToastTitle: "Unliked! (Fallback)",
    unlikedToastDescription: "You unliked \"{title}\". (Fallback)",
    dislikedToastTitle: "Disliked! (Fallback)",
    dislikedToastDescription: "You disliked \"{title}\". (Fallback)",
    dislikeRemovedToastTitle: "Dislike removed! (Fallback)",
    dislikeRemovedToastDescription: "Removed dislike for \"{title}\". (Fallback)",
    followedCategoryToastTitle: "Followed Category! (Fallback)",
    followedCategoryToastDescription: "Following \"{category}\". (Fallback)",
    unfollowedCategoryToastTitle: "Unfollowed Category! (Fallback)",
    unfollowedCategoryToastDescription: "Unfollowed \"{category}\". (Fallback)",
    noFeedItems: "No EkoDrops in your feed yet. (Fallback)",
    subscriptionUpdated: "Subscription Updated (Fallback)",
    subscriptionStatusNow: "Subscription status is now: {status}. (Fallback)",
    statusActive: "Active (Fallback)",
    statusInactive: "Inactive (Fallback)",
    billingSectionTitle: "Eko+ & In-App Purchases (Fallback)",
    billingSectionDescription: "Manage your Eko+ subscription and purchases. (Fallback)",
    subscriptionStatus: "Subscription Status (Fallback):",
    premiumActive: "Eko+ Active (Fallback)",
    notSubscribed: "Not Subscribed to Eko+ (Fallback)",
    subscribeToPremium: "Subscribe to Eko+ (Fallback)",
    availableInAppItems: "Available In-App Items (Fallback):",
    processingSubscription: "Processing Subscription... (Fallback)",
    pleaseWait: "Please wait. (Fallback)",
    subscriptionSuccessful: "Subscription Successful! (Fallback)",
    youAreNowSubscribed: "You are now subscribed to Eko+. (Fallback)",
    subscriptionFailed: "Subscription Failed (Fallback)",
    couldNotCompleteSubscription: "Could not complete subscription. (Fallback)",
    subscriptionError: "Subscription Error (Fallback)",
    mobileBridgeNotFound: "Mobile App Bridge Not Found (Fallback)",
    featureOnlyInMobileApp: "This feature is only available in the mobile app. (Fallback)",
    purchasingItem: "Purchasing {title}... (Fallback)",
    purchaseSuccessful: "Purchase Successful! (Fallback)",
    youHavePurchasedItem: "You have purchased {title}. (Fallback)",
    purchaseFailed: "Purchase Failed (Fallback)",
    couldNotPurchaseItem: "Could not purchase {title}. (Fallback)",
    purchaseError: "Purchase Error (Fallback)",
    playNext: "Play Next (Fallback)",
    playing: "Playing (Fallback)",
    pause: "Pause (Fallback)",
    play: "Play (Fallback)",
  },
  AppHeader: {
    eko: "Eko (Fallback)",
    savedEkoDropsTooltip: "Saved EkoDrops (Fallback)",
    personalizeFeedTooltip: "Personalize My Feed (AI) (Fallback)",
    language: "Language (Fallback)",
    fontSize: "Font Size (Fallback)",
    fontSizeSmall: "Small (Fallback)",
    fontSizeMedium: "Medium (Fallback)",
    fontSizeLarge: "Large (Fallback)",
  },
  FeedItemCard: {
    adBadge: "Ad (Fallback)",
    sponsoredBy: "Sponsored by {advertiser} (Fallback)",
    categoriesLabel: "Categories: (Fallback)",
    rateThisAdLabel: "Rate this ad (Fallback)",
    rateThisContentLabel: "Rate this content (Fallback)",
    dislikeAction: "Dislike (Fallback)",
    likeAction: "Like (Fallback)",
    commentAction: "Comment (Fallback)",
    shareAction: "Share (Fallback)",
    shareOnFacebook: "Share on Facebook (Fallback)",
    shareOnTwitter: "Share on Twitter (Fallback)",
    shareOnInstagram: "Share on Instagram (Fallback)",
    playEkoDrop: "Play EkoDrop (Fallback)",
    pauseEkoDrop: "Pause EkoDrop (Fallback)",
    audioBy: "Audio by {user} (Fallback)",
    hashtags: "Hashtags: (Fallback)",
    postedOn: "Posted on {date} (Fallback)",
    viewTranscript: "View Transcript (Fallback)",
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Switch to light theme (Fallback)",
    switchToDarkTheme: "Switch to dark theme (Fallback)"
  },
  SavedAdsPage: {
    backToFeed: "Back to Feed (Fallback)",
    mySavedEkoDrops: "My Saved EkoDrops (Fallback)",
    errorLoadingSavedEkoDrops: "Could not load saved EkoDrops. (Fallback)",
    infoToastTitle: "Info (Fallback)",
    personalizeInfoDescription: "Feed personalization is available on the main feed page. (Fallback)",
    unlikedAndRemovedToastDescription: "You unliked \"{title}\". It has been removed. (Fallback)",
    dislikedAndRemovedToastDescription: "You disliked \"{title}\". It has been removed. (Fallback)",
    noSavedEkoDropsYet: "You haven't saved any EkoDrops yet. (Fallback)",
    likeEkoDropToSave: "Like an EkoDrop in the main feed to save it here! (Fallback)"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo Banner (Fallback)",
    demoAdUnitId: "Demo Ad Unit ID (Fallback):",
    placeholderText: "(This is a placeholder, not a live ad) (Fallback)"
  }
};


export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid.
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested. Triggering notFound().`);
    notFound();
  }

  let messages;
  try {
    // Dynamically import the messages for the requested locale.
    const module = await import(`./messages/${locale}.json`);
    messages = module.default;

    // Basic validation
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Using hardcoded fallback.`);
      messages = minimalFallbackMessages; // Fallback to ensure provider gets valid structure
    }
  } catch (error) {
    console.error(`i18n.ts: Could not load messages for locale "${locale}". Error: ${error}. Triggering notFound().`);
    notFound(); // If the message file for a supported locale is missing/corrupt
  }

  return {
    messages: messages,
    // Time zone can be configured here if needed
    // timeZone: 'Europe/Vienna',
  };
});
