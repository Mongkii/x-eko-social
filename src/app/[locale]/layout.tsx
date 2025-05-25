
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/i18n';
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from '@/contexts/font-size-context';
import { Toaster } from "@/components/ui/toaster";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

// Comprehensive fallback messages for the NextIntlClientProvider
// This ensures client components have all necessary keys if actual message loading fails.
const ultimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Eko (Client Fallback)",
    ratingSubmittedToastTitle: "Rating Submitted! (FB)",
    ratingSubmittedToastDescription: "You rated \"{title}\" {rating} stars. (FB)",
    likedToastTitle: "Liked! (FB)",
    likedToastDescription: "You liked \"{title}\". (FB)",
    unlikedToastTitle: "Unliked! (FB)",
    unlikedToastDescription: "You unliked \"{title}\". (FB)",
    dislikedToastTitle: "Disliked! (FB)",
    dislikedToastDescription: "You disliked \"{title}\". (FB)",
    dislikeRemovedToastTitle: "Dislike removed! (FB)",
    dislikeRemovedToastDescription: "Removed dislike for \"{title}\". (FB)",
    followedCategoryToastTitle: "Followed Category! (FB)",
    followedCategoryToastDescription: "Following {category}. (FB)",
    unfollowedCategoryToastTitle: "Unfollowed Category! (FB)",
    unfollowedCategoryToastDescription: "Unfollowed {category}. (FB)"
  },
  HomePage: {
    aiMagicToastTitle: "AI Magic ✨ (FB)",
    aiMagicToastDescription: "Personalizing your feed... (FB)",
    aiPersonalizationErrorToastTitle: "AI Personalization Error (FB)",
    aiPersonalizationErrorToastDescription: "Could not personalize feed at this time. (FB)",
    aiFeedPersonalizedToastTitle: "AI Feed Personalization (Simulated) (FB)",
    aiFeedPersonalizedToastDescription: "Your feed has been updated based on your interactions. (FB)",
    noFeedItems: "No EkoDrops in your feed yet. Explore or create! (FB)",
    billingSectionTitle: "Eko+ & In-App Purchases (FB)",
    billingSectionDescription: "Manage your subscription and get cool extras! (FB)",
    subscriptionStatus: "Subscription Status (FB)",
    premiumActive: "Eko+ Premium Active (FB)",
    notSubscribed: "Not Subscribed to Eko+ (FB)",
    subscribeToPremium: "Subscribe to Eko+ (FB)",
    availableInAppItems: "Available In-App Items (FB)",
    processingSubscription: "Processing Subscription... (FB)",
    pleaseWait: "Please wait a moment. (FB)",
    subscriptionSuccessful: "Subscription Successful! (FB)",
    youAreNowSubscribed: "You are now an Eko+ subscriber. (FB)",
    subscriptionFailed: "Subscription Failed (FB)",
    couldNotCompleteSubscription: "We could not complete your subscription. Please try again. (FB)",
    subscriptionError: "Subscription Error (FB)",
    mobileBridgeNotFound: "Mobile App Bridge Not Found (FB)",
    featureOnlyInMobileApp: "This feature is only available in the mobile app. (FB)",
    purchasingItem: "Purchasing {title}... (FB)",
    purchaseSuccessful: "Purchase Successful! (FB)",
    youHavePurchasedItem: "You have successfully purchased {title}. (FB)",
    purchaseFailed: "Purchase Failed (FB)",
    couldNotPurchaseItem: "Could not complete the purchase for {title}. (FB)",
    purchaseError: "Purchase Error (FB)",
    subscriptionUpdated: "Subscription Status Updated (FB)",
    subscriptionStatusNow: "Your Eko+ subscription is now {status}. (FB)",
    statusActive: "Active (FB)",
    statusInactive: "Inactive (FB)"
  },
  AppHeader: {
    appName: "Eko (Client Fallback)",
    savedEkoDropsTooltip: "Saved EkoDrops (FB)",
    personalizeFeedTooltip: "Personalize My Feed (AI) (FB)",
    settingsTooltip: "Settings (FB)",
    languageLabel: "Language (FB)",
    fontSizeLabel: "Font Size (FB)",
    themeLabel: "Theme (FB)"
  },
  FeedItemCard: {
    voicePost: "Voice Post (FB)",
    adBadge: "Ad (FB)",
    sponsoredBy: "Sponsored by {advertiser} (FB)",
    noDescription: "No description available. (FB)",
    postedDate: "Posted {date} (FB)",
    byUser: "by (FB)",
    durationLabel: "Duration (FB)",
    categoriesLabel: "Categories (FB)",
    rateThisAdLabel: "Rate this Ad (FB)",
    rateThisContentLabel: "Rate this EkoDrop (FB)",
    dislikeAction: "Dislike (FB)",
    likeAction: "Like (FB)",
    commentAction: "Comment (FB)",
    shareAction: "Share (FB)",
    noMedia: "No audio for this EkoDrop. (FB)",
    dateUnknown: "a while ago (FB)",
    dateInvalid: "an invalid date (FB)",
    dateRecently: "recently (FB)",
    watchRewardedAdButton: "Watch Ad for Reward (FB)"
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Switch to Light Theme (FB)",
    switchToDarkTheme: "Switch to Dark Theme (FB)"
  },
  SavedEkoDropsPage: {
    backToFeed: "Back to Feed (FB)",
    mySavedAds: "My Saved EkoDrops (FB)",
    errorLoadingSavedAds: "Error: Could not load saved EkoDrops. (FB)",
    infoToastTitle: "Info (FB)",
    personalizeInfoDescription: "Feed personalization is available on the main feed page. (FB)",
    unlikedAndRemovedToastDescription: "You unliked \"{title}\". It has been removed from your saved EkoDrops. (FB)",
    dislikedAndRemovedToastDescription: "You disliked \"{title}\". It has been removed from your saved EkoDrops. (FB)",
    noSavedAdsYet: "You haven't saved any EkoDrops yet. (FB)",
    likeAdToSave: "Like an EkoDrop in the main feed to save it here! (FB)"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo Banner (FB)",
    demoAdUnitIdLabel: "Demo Ad Unit ID (FB)",
    placeholderNotice: "This is a placeholder for a real ad. (FB)"
  },
  LanguageSwitcher: {
    selectLanguagePlaceholder: "Select Language (FB)",
    english: "English (FB)",
    arabic: "العربية (FB)",
    spanish: "Español (FB)",
    urdu: "اردو (FB)",
    french: "Français (FB)",
    german: "Deutsch (FB)",
    hindi: "हिन्दी (FB)",
    chinese: "中文 (FB)",
    tagalog: "Tagalog (FB)",
    russian: "Русский (FB)"
  },
  FontSizeSwitcher: {
    selectFontSizePlaceholder: "Select Font Size (FB)",
    small: "Small (FB)",
    medium: "Medium (FB)",
    large: "Large (FB)"
  }
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  
  if (!locales.includes(locale as Locale)) {
    console.warn(`LocaleLayout: Locale "${locale}" from params is not in defined locales. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages | undefined;
  try {
    // getMessages will now use the super-simplified config from i18n.ts
    messages = await getMessages({ locale });
    
    if (!messages || Object.keys(messages).length === 0 || 
        (Object.keys(messages).length === 1 && messages.Global && Object.keys(messages.Global).length === 1 && (messages.Global as any).appName === "Eko (Core Fallback)")
       ) {
      // If getMessages returns the minimalCoreMessages (or empty), we use the comprehensive fallback for the client
      console.warn(`LocaleLayout: Messages from getMessages for locale "${locale}" were minimal or empty. Using comprehensive ultimateFallbackMessages for NextIntlClientProvider.`);
      messages = ultimateFallbackMessages;
    } else {
      console.log(`LocaleLayout: Successfully received messages from getMessages for locale "${locale}".`);
    }
  } catch (error) {
    console.error(`LocaleLayout: Error calling getMessages for locale "${locale}". Using comprehensive ultimateFallbackMessages. Details:`, error);
    messages = ultimateFallbackMessages; 
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* ThemeProvider and FontSizeProvider are now in RootLayout */}
      {children}
    </NextIntlClientProvider>
  );
}
