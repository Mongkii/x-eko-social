// src/i18n.ts
import type {AbstractIntlMessages} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
// import {notFound} from 'next/navigation'; // Not currently used, but good for reference

export const defaultLocale = 'en' as const;
export const locales = [defaultLocale] as const; // Only 'en' for this setup
export type Locale = (typeof locales)[number];

// Minimal messages for next-intl's server-side core (e.g., middleware)
// to consider the configuration valid.
const serverConfigMessages: AbstractIntlMessages = {
  Global: {
    appName: "Shopyme (i18n Core)",
  }
};

// This function is used by next-intl's middleware and server-side utilities.
// It needs to return a valid messages object for the requested locale.
export default getRequestConfig(async ({locale}) => {
  console.log(`i18n.ts: getRequestConfig called for locale: "${locale}"`);

  // Validate that the incoming `locale` parameter is valid.
  if (!locales.includes(locale as any)) {
    console.error(`i18n.ts: Invalid locale "${locale}" requested. This should ideally be caught by middleware.`);
    // In a real multi-locale app, you might call notFound() here.
    // For a single-locale app, or to ensure server doesn't break, provide minimal fallback.
    return {
      messages: serverConfigMessages,
    };
  }

  // For this simplified setup, we always return the minimal server config messages
  // as the primary source of "truth" for next-intl's core.
  // RootLayout will provide more comprehensive messages to NextIntlClientProvider.
  console.log(`i18n.ts: Providing MINIMAL serverConfigMessages for locale "${locale}".`);
  return {
    messages: serverConfigMessages,
  };
});

// This comprehensive fallback object is now EXPORTED so RootLayout can import it.
// It's NOT directly used by getRequestConfig above to keep that minimal.
export const minimalFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Shopyme (Root FB)"
  },
  HomePage: {
    greeting: "Welcome (Root FB)",
    aiMagicToastTitle: "AI Magic ✨ (FB)",
    aiMagicToastDescription: "Personalizing... (FB)",
    aiPersonalizationErrorToastTitle: "AI Error (FB)",
    aiPersonalizationErrorToastDescription: "Could not personalize. (FB)",
    aiFeedPersonalizedToastTitle: "AI Feed (FB)",
    aiFeedPersonalizedToastDescription: "Feed updated. (FB)",
    ratingSubmittedToastTitle: "Rating submitted! (FB)",
    ratingSubmittedToastDescription: "You rated {title} {rating} stars. (FB)",
    likedToastTitle: "Liked! (FB)",
    likedToastDescription: "You liked {title}. (FB)",
    unlikedToastTitle: "Unliked! (FB)",
    unlikedToastDescription: "You unliked {title}. (FB)",
    dislikedToastTitle: "Disliked! (FB)",
    dislikedToastDescription: "You disliked {title}. (FB)",
    dislikeRemovedToastTitle: "Dislike removed! (FB)",
    dislikeRemovedToastDescription: "Removed dislike for {title}. (FB)",
    followedCategoryToastTitle: "Followed Category! (FB)",
    followedCategoryToastDescription: "Following {category}. (FB)",
    unfollowedCategoryToastTitle: "Unfollowed Category! (FB)",
    unfollowedCategoryToastDescription: "Unfollowed {category}. (FB)",
    noFeedItems: "No items. (FB)",
    subscriptionUpdated: "Subscription Updated (FB)",
    subscriptionStatusNow: "Status: {status}. (FB)",
    statusActive: "Active (FB)",
    statusInactive: "Inactive (FB)",
    billingSectionTitle: "Billing (FB)",
    billingSectionDescription: "Manage subscriptions. (FB)",
    subscriptionStatus: "Subscription Status (FB):",
    premiumActive: "Premium Active (FB)",
    notSubscribed: "Not Subscribed (FB)",
    subscribeToPremium: "Subscribe (FB)",
    availableInAppItems: "In-App Items (FB):",
    processingSubscription: "Processing... (FB)",
    pleaseWait: "Please wait. (FB)",
    subscriptionSuccessful: "Subscribed! (FB)",
    youAreNowSubscribed: "Now subscribed. (FB)",
    subscriptionFailed: "Failed. (FB)",
    couldNotCompleteSubscription: "Could not subscribe. (FB)",
    subscriptionError: "Error. (FB)",
    mobileBridgeNotFound: "Bridge not found. (FB)",
    featureOnlyInMobileApp: "Mobile app only. (FB)",
    purchasingItem: "Purchasing {title}... (FB)",
    purchaseSuccessful: "Purchased! (FB)",
    youHavePurchasedItem: "Purchased {title}. (FB)",
    purchaseFailed: "Purchase Failed. (FB)",
    couldNotPurchaseItem: "Could not purchase {title}. (FB)",
    purchaseError: "Purchase Error. (FB)"
  },
  AppHeader: {
    shopyme: "Shopyme (Root FB)",
    savedAdsTooltip: "Saved Ads (FB)",
    personalizeFeedTooltip: "Personalize (FB)"
  },
  FeedItemCard: {
    adBadge: "Ad (FB)",
    sponsoredBy: "Sponsored by (FB)",
    categoriesLabel: "Categories (FB)",
    rateThisAdLabel: "Rate this ad (FB)",
    rateThisContentLabel: "Rate this content (FB)",
    dislikeAction: "Dislike (FB)",
    likeAction: "Like (FB)",
    commentAction: "Comment (FB)",
    shareAction: "Share (FB)",
    shareOnFacebook: "Share on Facebook (FB)",
    shareOnTwitter: "Share on Twitter (FB)",
    shareOnInstagram: "Share on Instagram (FB)",
    rewardedAdTitle: "Watch Ad! (FB)",
    rewardedAdDescription: "Watch video for reward. (FB)",
    watchAdButton: "Watch Ad (FB)",
    rewardedAdBadge: "Rewarded Ad (FB)"
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Light Mode (FB)",
    switchToDarkTheme: "Dark Mode (FB)"
  },
  SavedAdsPage: {
    backToFeed: "Back to Feed (FB)",
    mySavedAds: "My Saved Ads (FB)",
    errorLoadingSavedAds: "Error loading. (FB)",
    infoToastTitle: "Info (FB)",
    personalizeInfoDescription: "Personalize on main feed. (FB)",
    unlikedAndRemovedToastDescription: "Unliked and removed. (FB)",
    dislikedAndRemovedToastDescription: "Disliked and removed. (FB)",
    noSavedAdsYet: "No saved ads. (FB)",
    likeAdToSave: "Like to save. (FB)"
  },
  AdMobBanner: { // Ensure this is a valid object
    demoBannerTitle: "AdMob Demo (FB)",
    demoAdUnitId: "Demo Ad Unit ID (FB):",
    placeholderText: "(Placeholder ad) (FB)"
  }
};
