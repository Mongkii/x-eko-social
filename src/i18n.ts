
import {getRequestConfig, type AbstractIntlMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import enMessages from './messages/en.json'; // Static import for default locale

// Define locales and default locale directly
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

// A minimal set of messages for ultimate fallback if even English fails to load.
// This ensures NextIntlClientProvider always gets a structured object.
const ultimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko (Ultimate Fallback)",
    loading: "Loading (Ultimate Fallback)...",
  },
  HomePage: {
    greeting: "Welcome to Eko (Ultimate Fallback)",
    aiMagicToastTitle: "AI Magic ✨ (Ultimate Fallback)",
    aiMagicToastDescription: "Personalizing... (Ultimate Fallback)",
    aiPersonalizationErrorToastTitle: "AI Error (Ultimate Fallback)",
    aiPersonalizationErrorToastDescription: "Could not personalize. (Ultimate Fallback)",
    aiFeedPersonalizedToastTitle: "AI Feed (Ultimate Fallback)",
    aiFeedPersonalizedToastDescription: "Feed updated. (Ultimate Fallback)",
    ratingSubmittedToastTitle: "Rating submitted! (Ultimate Fallback)",
    ratingSubmittedToastDescription: "You rated {title} {rating} stars. (Ultimate Fallback)",
    likedToastTitle: "Liked! (Ultimate Fallback)",
    likedToastDescription: "You liked {title}. (Ultimate Fallback)",
    unlikedToastTitle: "Unliked! (Ultimate Fallback)",
    unlikedToastDescription: "You unliked {title}. (Ultimate Fallback)",
    dislikedToastTitle: "Disliked! (Ultimate Fallback)",
    dislikedToastDescription: "You disliked {title}. (Ultimate Fallback)",
    dislikeRemovedToastTitle: "Dislike removed! (Ultimate Fallback)",
    dislikeRemovedToastDescription: "Removed dislike for {title}. (Ultimate Fallback)",
    followedCategoryToastTitle: "Followed Category! (Ultimate Fallback)",
    followedCategoryToastDescription: "Following {category}. (Ultimate Fallback)",
    unfollowedCategoryToastTitle: "Unfollowed Category! (Ultimate Fallback)",
    unfollowedCategoryToastDescription: "Unfollowed {category}. (Ultimate Fallback)",
    noFeedItems: "No EkoDrops in your feed yet. Record one! (Ultimate Fallback)",
    subscriptionUpdated: "Subscription Updated (Ultimate Fallback)",
    subscriptionStatusNow: "Subscription status is now: {status}. (Ultimate Fallback)",
    statusActive: "Active (Ultimate Fallback)",
    statusInactive: "Inactive (Ultimate Fallback)",
    billingSectionTitle: "Eko+ & In-App Purchases (Ultimate Fallback)",
    billingSectionDescription: "Manage your Eko+ subscription and purchases. (Ultimate Fallback)",
    subscriptionStatus: "Subscription Status (Ultimate Fallback):",
    premiumActive: "Eko+ Active (Ultimate Fallback)",
    notSubscribed: "Not Subscribed to Eko+ (Ultimate Fallback)",
    subscribeToPremium: "Subscribe to Eko+ (Ultimate Fallback)",
    availableInAppItems: "Available In-App Items (Ultimate Fallback):",
    processingSubscription: "Processing Subscription... (Ultimate Fallback)",
    pleaseWait: "Please wait. (Ultimate Fallback)",
    subscriptionSuccessful: "Subscription Successful! (Ultimate Fallback)",
    youAreNowSubscribed: "You are now subscribed to Eko+. (Ultimate Fallback)",
    subscriptionFailed: "Subscription Failed (Ultimate Fallback)",
    couldNotCompleteSubscription: "Could not complete subscription. (Ultimate Fallback)",
    subscriptionError: "Subscription Error (Ultimate Fallback)",
    mobileBridgeNotFound: "Mobile App Bridge Not Found (Ultimate Fallback)",
    featureOnlyInMobileApp: "This feature is only available in the mobile app. (Ultimate Fallback)",
    purchasingItem: "Purchasing {item}... (Ultimate Fallback)", // Note: using item, ensure consistency
    purchaseSuccessful: "Purchase Successful! (Ultimate Fallback)",
    youHavePurchasedItem: "You have purchased {item}. (Ultimate Fallback)",
    purchaseFailed: "Purchase Failed (Ultimate Fallback)",
    couldNotPurchaseItem: "Could not purchase {item}. (Ultimate Fallback)",
    purchaseError: "Purchase Error (Ultimate Fallback)",
    playNext: "Play Next (Ultimate Fallback)",
    playing: "Playing (Ultimate Fallback)",
    pause: "Pause (Ultimate Fallback)",
    play: "Play (Ultimate Fallback)",
  },
  AppHeader: {
    eko: "Eko (Ultimate Fallback)",
    savedEkoDropsTooltip: "Saved EkoDrops (Ultimate Fallback)",
    personalizeFeedTooltip: "Personalize My Feed (AI) (Ultimate Fallback)",
    language: "Language (Ultimate Fallback)",
    fontSize: "Font Size (Ultimate Fallback)",
    fontSizeSmall: "Small (Ultimate Fallback)",
    fontSizeMedium: "Medium (Ultimate Fallback)",
    fontSizeLarge: "Large (Ultimate Fallback)",
  },
  FeedItemCard: {
    adBadge: "Ad (Ultimate Fallback)",
    sponsoredBy: "Sponsored by {advertiser} (Ultimate Fallback)",
    categoriesLabel: "Categories: (Ultimate Fallback)",
    rateThisAdLabel: "Rate this ad (Ultimate Fallback)",
    rateThisContentLabel: "Rate this content (Ultimate Fallback)",
    dislikeAction: "Dislike (Ultimate Fallback)",
    likeAction: "Like (Ultimate Fallback)",
    commentAction: "Comment (Ultimate Fallback)",
    shareAction: "Share (Ultimate Fallback)",
    shareOnFacebook: "Share on Facebook (Ultimate Fallback)",
    shareOnTwitter: "Share on Twitter (Ultimate Fallback)",
    shareOnInstagram: "Share on Instagram (Ultimate Fallback)",
    playEkoDrop: "Play EkoDrop (Ultimate Fallback)",
    pauseEkoDrop: "Pause EkoDrop (Ultimate Fallback)",
    audioBy: "Audio by {user} (Ultimate Fallback)",
    hashtags: "Hashtags: (Ultimate Fallback)",
    postedOn: "Posted {date} (Ultimate Fallback)",
    viewTranscript: "View Transcript (Ultimate Fallback)",
    rewardedAdTitle: "Watch Ad! (Ultimate Fallback)",
    rewardedAdDescription: "Watch video for reward. (Ultimate Fallback)",
    watchAdButton: "Watch Ad (Ultimate Fallback)",
    rewardedAdBadge: "Rewarded Ad (Ultimate Fallback)",
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Switch to light theme (Ultimate Fallback)",
    switchToDarkTheme: "Switch to dark theme (Ultimate Fallback)"
  },
  SavedAdsPage: {
    backToFeed: "Back to Feed (Ultimate Fallback)",
    mySavedEkoDrops: "My Saved EkoDrops (Ultimate Fallback)",
    errorLoadingSavedEkoDrops: "Could not load saved EkoDrops. (Ultimate Fallback)",
    infoToastTitle: "Info (Ultimate Fallback)",
    personalizeInfoDescription: "Feed personalization is available on the main feed page. (Ultimate Fallback)",
    unlikedAndRemovedToastDescription: "You unliked \"{title}\". It has been removed. (Ultimate Fallback)",
    dislikedAndRemovedToastDescription: "You disliked \"{title}\". It has been removed. (Ultimate Fallback)",
    noSavedEkoDropsYet: "You haven't saved any EkoDrops yet. (Ultimate Fallback)",
    likeEkoDropToSave: "Like an EkoDrop in the main feed to save it here! (Ultimate Fallback)"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo Banner (Ultimate Fallback)",
    demoAdUnitId: "Demo Ad Unit ID (Ultimate Fallback):",
    placeholderText: "(This is a placeholder, not a live ad) (Ultimate Fallback)"
  }
};


export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a supported locale
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested. Triggering notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;

  if (locale === defaultLocale) {
    // For the default locale (English), use the statically imported messages.
    // This ensures en.json is always available and parsed correctly.
    messages = enMessages as AbstractIntlMessages;
    if (typeof messages !== 'object' || messages === null || Object.keys(messages).length === 0) {
      console.error(`i18n.ts: Statically imported 'en.json' for locale "${locale}" is invalid or empty. Using ultimate fallback.`);
      messages = ultimateFallbackMessages;
    }
  } else {
    // For other locales, use dynamic import.
    try {
      const module = await import(`./messages/${locale}.json`);
      let rawMessages = module.default;

      if (typeof rawMessages === 'string') {
        // This handles cases where the build system might return a string for JSON.
        console.warn(`i18n.ts: Messages for locale "${locale}" were imported as a string. Attempting JSON.parse.`);
        try {
          messages = JSON.parse(rawMessages);
        } catch (parseError) {
          console.error(`i18n.ts: Failed to parse JSON string for locale "${locale}". Error: ${parseError}. This locale will be marked as not found.`);
          notFound(); // Critical error for this locale
        }
      } else {
        messages = rawMessages as AbstractIntlMessages;
      }

      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.error(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import/parse. This locale will be marked as not found.`);
        notFound(); // Critical error for this locale
      }
    } catch (error) {
      console.error(`i18n.ts: Could not load messages for locale "${locale}" (e.g., file missing). Error: ${error}. This locale will be marked as not found.`);
      notFound(); // Critical error for this locale
    }
  }

  return {
    messages,
  };
});
