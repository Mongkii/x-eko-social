
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

// Define the locales you want to support
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Hardcoded comprehensive fallback messages for English
// This ensures that getRequestConfig ALWAYS returns a valid, rich message object for 'en'
// and as a fallback for other locales if their specific files fail.
const ultimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko",
    ratingSubmittedToastTitle: "Rating Submitted!",
    ratingSubmittedToastDescription: "You rated \"{title}\" {rating} stars.",
    likedToastTitle: "Liked!",
    likedToastDescription: "You liked \"{title}\".",
    unlikedToastTitle: "Unliked!",
    unlikedToastDescription: "You unliked \"{title}\".",
    dislikedToastTitle: "Disliked!",
    dislikedToastDescription: "You disliked \"{title}\".",
    dislikeRemovedToastTitle: "Dislike Removed!",
    dislikeRemovedToastDescription: "You removed your dislike for \"{title}\".",
    followedCategoryToastTitle: "Followed Category!",
    followedCategoryToastDescription: "You are now following \"{category}\".",
    unfollowedCategoryToastTitle: "Unfollowed Category!",
    unfollowedCategoryToastDescription: "You have unfollowed \"{category}\"."
  },
  HomePage: {
    aiMagicToastTitle: "AI Magic ✨",
    aiMagicToastDescription: "Personalizing your feed...",
    aiPersonalizationErrorToastTitle: "AI Personalization Error",
    aiPersonalizationErrorToastDescription: "Could not personalize feed at this time.",
    aiFeedPersonalizedToastTitle: "AI Feed Personalization (Simulated)",
    aiFeedPersonalizedToastDescription: "Your feed has been updated based on your interactions.",
    noFeedItems: "No EkoDrops in your feed yet. Explore or create!",
    billingSectionTitle: "Eko+ & In-App Purchases",
    billingSectionDescription: "Manage your subscription and get cool extras!",
    subscriptionStatus: "Subscription Status",
    premiumActive: "Eko+ Premium Active",
    notSubscribed: "Not Subscribed to Eko+",
    subscribeToPremium: "Subscribe to Eko+",
    availableInAppItems: "Available In-App Items",
    processingSubscription: "Processing Subscription...",
    pleaseWait: "Please wait a moment.",
    subscriptionSuccessful: "Subscription Successful!",
    youAreNowSubscribed: "You are now an Eko+ subscriber.",
    subscriptionFailed: "Subscription Failed",
    couldNotCompleteSubscription: "We could not complete your subscription. Please try again.",
    subscriptionError: "Subscription Error",
    mobileBridgeNotFound: "Mobile App Bridge Not Found",
    featureOnlyInMobileApp: "This feature is only available in the mobile app.",
    purchasingItem: "Purchasing {title}...",
    purchaseSuccessful: "Purchase Successful!",
    youHavePurchasedItem: "You have successfully purchased {title}.",
    purchaseFailed: "Purchase Failed",
    couldNotPurchaseItem: "Could not complete the purchase for {title}.",
    purchaseError: "Purchase Error",
    subscriptionUpdated: "Subscription Status Updated",
    subscriptionStatusNow: "Your Eko+ subscription is now {status}.",
    statusActive: "Active",
    statusInactive: "Inactive"
  },
  AppHeader: {
    appName: "Eko",
    savedEkoDropsTooltip: "Saved EkoDrops",
    personalizeFeedTooltip: "Personalize My Feed (AI)",
    settingsTooltip: "Settings",
    languageLabel: "Language",
    fontSizeLabel: "Font Size",
    themeLabel: "Theme"
  },
  FeedItemCard: {
    voicePost: "Voice Post",
    adBadge: "Ad",
    sponsoredBy: "Sponsored by {advertiser}",
    noDescription: "No description available.",
    postedDate: "Posted {date}",
    byUser: "by",
    durationLabel: "Duration",
    categoriesLabel: "Categories",
    rateThisAdLabel: "Rate this Ad",
    rateThisContentLabel: "Rate this EkoDrop",
    dislikeAction: "Dislike",
    likeAction: "Like",
    commentAction: "Comment",
    shareAction: "Share",
    noMedia: "No audio for this EkoDrop.",
    dateUnknown: "a while ago",
    dateInvalid: "an invalid date",
    dateRecently: "recently",
    watchRewardedAdButton: "Watch Ad for Reward"
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Switch to Light Theme",
    switchToDarkTheme: "Switch to Dark Theme"
  },
  SavedEkoDropsPage: {
    backToFeed: "Back to Feed",
    mySavedAds: "My Saved EkoDrops",
    errorLoadingSavedAds: "Error: Could not load saved EkoDrops.",
    infoToastTitle: "Info",
    personalizeInfoDescription: "Feed personalization is available on the main feed page.",
    unlikedAndRemovedToastDescription: "You unliked \"{title}\". It has been removed from your saved EkoDrops.",
    dislikedAndRemovedToastDescription: "You disliked \"{title}\". It has been removed from your saved EkoDrops.",
    noSavedAdsYet: "You haven't saved any EkoDrops yet.",
    likeAdToSave: "Like an EkoDrop in the main feed to save it here!"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo Banner",
    demoAdUnitIdLabel: "Demo Ad Unit ID",
    placeholderNotice: "This is a placeholder for a real ad."
  },
  LanguageSwitcher: {
    selectLanguagePlaceholder: "Select Language",
    english: "English",
    arabic: "العربية",
    spanish: "Español",
    urdu: "اردو",
    french: "Français",
    german: "Deutsch",
    hindi: "हिन्दी",
    chinese: "中文",
    tagalog: "Tagalog",
    russian: "Русский"
  },
  FontSizeSwitcher: {
    selectFontSizePlaceholder: "Select Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large"
  }
};


export default getRequestConfig(async ({locale}: {locale: string}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  if (locale === defaultLocale) {
    // For English, always return the hardcoded comprehensive messages.
    // This bypasses all file I/O and parsing for the default locale's config.
    console.log(`i18n.ts: Providing hardcoded 'ultimateFallbackMessages' for default locale "${locale}".`);
    return {
      messages: ultimateFallbackMessages
    };
  }

  // For other locales, attempt to dynamically import.
  // If this fails, we'll also fall back to English (ultimateFallbackMessages).
  try {
    console.log(`i18n.ts: Attempting to dynamically load messages for locale "${locale}".`);
    const importedModule = await import(`./messages/${locale}.json`);
    let potentialMessages = importedModule.default || importedModule;

    if (typeof potentialMessages === 'string') {
      console.warn(`i18n.ts: Messages for locale "${locale}" were imported as a string. Attempting JSON.parse.`);
      try {
        potentialMessages = JSON.parse(potentialMessages);
      } catch (parseError) {
        console.error(`i18n.ts: Failed to parse JSON for locale "${locale}" after importing as string. Content snippet: ${(potentialMessages as string).substring(0, 100)}. Using ultimate fallback. Error:`, parseError);
        return { messages: ultimateFallbackMessages };
      }
    }

    if (typeof potentialMessages === 'object' && potentialMessages !== null && Object.keys(potentialMessages).length > 0) {
      console.log(`i18n.ts: Successfully loaded and parsed messages for locale "${locale}".`);
      return {
        messages: potentialMessages as AbstractIntlMessages
      };
    } else {
      console.error(`i18n.ts: Messages for locale "${locale}" are not a valid or non-empty object after import/parse. Using ultimate fallback. Content:`, potentialMessages);
      return { messages: ultimateFallbackMessages };
    }
  } catch (error) {
    console.error(`i18n.ts: Critical error loading messages for locale "${locale}". Using ultimate fallback. Details:`, error);
    return {
      messages: ultimateFallbackMessages
    };
  }
});

// Export types for use in other parts of the application
export type Messages = AbstractIntlMessages;
