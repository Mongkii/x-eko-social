
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

// Define your supported locales
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Define a comprehensive fallback message object directly in this file.
// This structure should mirror your en.json to ensure all keys are present.
export const i18nUltimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko",
    ratingSubmittedToastTitle: "Rating Submitted! (Fallback)",
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
    followedCategoryToastDescription: "Following {category}. (Fallback)",
    unfollowedCategoryToastTitle: "Unfollowed Category! (Fallback)",
    unfollowedCategoryToastDescription: "Unfollowed {category}. (Fallback)"
  },
  HomePage: {
    aiMagicToastTitle: "AI Magic ✨ (Fallback)",
    aiMagicToastDescription: "Personalizing your feed... (Fallback)",
    aiPersonalizationErrorToastTitle: "AI Personalization Error (Fallback)",
    aiPersonalizationErrorToastDescription: "Could not personalize feed at this time. (Fallback)",
    aiFeedPersonalizedToastTitle: "AI Feed Personalization (Simulated) (Fallback)",
    aiFeedPersonalizedToastDescription: "Your feed has been updated based on your interactions. (Fallback)",
    noFeedItems: "No EkoDrops in your feed yet. Explore or create! (Fallback)",
    billingSectionTitle: "Eko+ & In-App Purchases (Fallback)",
    billingSectionDescription: "Manage your subscription and get cool extras! (Fallback)",
    subscriptionStatus: "Subscription Status (Fallback)",
    premiumActive: "Eko+ Premium Active (Fallback)",
    notSubscribed: "Not Subscribed to Eko+ (Fallback)",
    subscribeToPremium: "Subscribe to Eko+ (Fallback)",
    availableInAppItems: "Available In-App Items (Fallback)",
    processingSubscription: "Processing Subscription... (Fallback)",
    pleaseWait: "Please wait a moment. (Fallback)",
    subscriptionSuccessful: "Subscription Successful! (Fallback)",
    youAreNowSubscribed: "You are now an Eko+ subscriber. (Fallback)",
    subscriptionFailed: "Subscription Failed (Fallback)",
    couldNotCompleteSubscription: "We could not complete your subscription. Please try again. (Fallback)",
    subscriptionError: "Subscription Error (Fallback)",
    mobileBridgeNotFound: "Mobile App Bridge Not Found (Fallback)",
    featureOnlyInMobileApp: "This feature is only available in the mobile app. (Fallback)",
    purchasingItem: "Purchasing {title}... (Fallback)",
    purchaseSuccessful: "Purchase Successful! (Fallback)",
    youHavePurchasedItem: "You have successfully purchased {title}. (Fallback)",
    purchaseFailed: "Purchase Failed (Fallback)",
    couldNotPurchaseItem: "Could not complete the purchase for {title}. (Fallback)",
    purchaseError: "Purchase Error (Fallback)",
    subscriptionUpdated: "Subscription Status Updated (Fallback)",
    subscriptionStatusNow: "Your Eko+ subscription is now {status}. (Fallback)",
    statusActive: "Active (Fallback)",
    statusInactive: "Inactive (Fallback)"
  },
  AppHeader: {
    appName: "Eko (Fallback)",
    savedEkoDropsTooltip: "Saved EkoDrops (Fallback)",
    personalizeFeedTooltip: "Personalize My Feed (AI) (Fallback)",
    settingsTooltip: "Settings (Fallback)",
    languageLabel: "Language (Fallback)",
    fontSizeLabel: "Font Size (Fallback)",
    themeLabel: "Theme (Fallback)"
  },
  FeedItemCard: {
    voicePost: "Voice Post (Fallback)",
    adBadge: "Ad (Fallback)",
    sponsoredBy: "Sponsored by {advertiser} (Fallback)",
    noDescription: "No description available. (Fallback)",
    postedDate: "Posted {date} (Fallback)",
    byUser: "by (Fallback)",
    durationLabel: "Duration (Fallback)",
    categoriesLabel: "Categories (Fallback)",
    rateThisAdLabel: "Rate this Ad (Fallback)",
    rateThisContentLabel: "Rate this EkoDrop (Fallback)",
    dislikeAction: "Dislike (Fallback)",
    likeAction: "Like (Fallback)",
    commentAction: "Comment (Fallback)",
    shareAction: "Share (Fallback)",
    noMedia: "No audio for this EkoDrop. (Fallback)",
    dateUnknown: "a while ago (Fallback)",
    dateInvalid: "an invalid date (Fallback)",
    dateRecently: "recently (Fallback)",
    watchRewardedAdButton: "Watch Ad for Reward (Fallback)"
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Switch to Light Theme (Fallback)",
    switchToDarkTheme: "Switch to Dark Theme (Fallback)",
    systemTheme: "System (Fallback)"
  },
  SavedEkoDropsPage: {
    backToFeed: "Back to Feed (Fallback)",
    mySavedAds: "My Saved EkoDrops (Fallback)",
    errorLoadingSavedAds: "Error: Could not load saved EkoDrops. (Fallback)",
    infoToastTitle: "Info (Fallback)",
    personalizeInfoDescription: "Feed personalization is available on the main feed page. (Fallback)",
    unlikedAndRemovedToastDescription: "You unliked \"{title}\". It has been removed from your saved EkoDrops. (Fallback)",
    dislikedAndRemovedToastDescription: "You disliked \"{title}\". It has been removed from your saved EkoDrops. (Fallback)",
    noSavedAdsYet: "You haven't saved any EkoDrops yet. (Fallback)",
    likeAdToSave: "Like an EkoDrop in the main feed to save it here! (Fallback)"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo Banner (Fallback)",
    demoBannerDescription: "This is a simulation of an AdMob banner ad. (Fallback)",
    adUnitIdLabel: "Ad Unit ID: (Fallback)"
  },
  LanguageSwitcher: {
    selectLanguageLabel: "Select Language (Fallback)"
  },
  FontSizeSwitcher: {
    small: "Small (Fallback)",
    medium: "Medium (Fallback)",
    large: "Large (Fallback)"
  }
};

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a valid locale
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Invalid locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    // Dynamically import the message file for the requested locale
    // The `default` is important here because the JSON files are CJS modules
    messages = (await import(`./messages/${locale}.json`)).default;
    
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Using ultimate fallback messages.`);
      messages = i18nUltimateFallbackMessages;
    }
  } catch (error) {
    console.error(`i18n.ts: Could not load messages for locale "${locale}". Error: ${error}. Using ultimate fallback messages.`);
    messages = i18nUltimateFallbackMessages;
  }
  
  return {
    messages: messages as AbstractIntlMessages,
  };
});
