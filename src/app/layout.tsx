
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server'; // For server components
import { defaultLocale } from '@/i18n'; 

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shopyme',
  description: 'Personalized Ad Feed Experience',
};

// Minimal fallback messages for RootLayout
const minimalFallbackMessages: AbstractIntlMessages = {
  Global: { appName: "Shopyme (Root FB)" },
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
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo (FB)",
    demoAdUnitId: "Demo Ad Unit ID (FB):",
    placeholderText: "(Placeholder ad) (FB)"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let messages: AbstractIntlMessages;
  try {
    // For a single-language app (English only) directly using getMessages() is fine
    // If you were to use [locale] segments, you'd pass {locale} to getMessages.
    messages = await getMessages({ locale: defaultLocale });
  } catch (error) {
    console.error("RootLayout: Failed to load messages, using MINIMAL hardcoded fallback. Error:", error);
    messages = minimalFallbackMessages; 
  }

  // Fallback if messages are still undefined or empty after the try-catch
  if (!messages || Object.keys(messages).length === 0) {
    console.warn("RootLayout: Messages object is empty or invalid after attempting to load/fallback. Using MINIMAL hardcoded fallback again.");
    messages = minimalFallbackMessages;
  }

  return (
    <html lang={defaultLocale} className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        <NextIntlClientProvider locale={defaultLocale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
