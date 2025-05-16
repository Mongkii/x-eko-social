import { getRequestConfig, AbstractIntlMessages } from 'next-intl/server';
// Assuming en.json is your primary message file for English
import enMessages from './messages/en.json';

export const locales = ['en'];
export const defaultLocale = 'en';

// Minimal fallback messages, directly in i18n.ts
// This is a last resort if en.json itself is problematic or to simplify.
const ultimateFallbackMessages: AbstractIntlMessages = {
  Global: { appName: "Shopyme (i18n Ultimate Fallback)" },
  HomePage: { greeting: "Welcome (i18n Ultimate Fallback)" },
  AppHeader: {
    shopyme: "Shopyme (i18n Ultimate Fallback)",
    savedAdsTooltip: "Saved Ads (i18n Ultimate Fallback)",
    personalizeFeedTooltip: "Personalize (i18n Ultimate Fallback)"
  },
  FeedItemCard: {
    adBadge: "Ad (i18n Ultimate Fallback)",
    sponsoredBy: "Sponsored by (i18n Ultimate Fallback)",
    categoriesLabel: "Categories (i18n Ultimate Fallback)",
    rateThisAdLabel: "Rate this ad (i18n Ultimate Fallback)",
    rateThisContentLabel: "Rate this content (i18n Ultimate Fallback)",
    dislikeAction: "Dislike (i18n Ultimate Fallback)",
    likeAction: "Like (i18n Ultimate Fallback)",
    commentAction: "Comment (i18n Ultimate Fallback)",
    shareAction: "Share (i18n Ultimate Fallback)",
    shareOnFacebook: "Share on Facebook (i18n Ultimate Fallback)",
    shareOnTwitter: "Share on Twitter (i18n Ultimate Fallback)",
    shareOnInstagram: "Share on Instagram (i18n Ultimate Fallback)",
    rewardedAdTitle: "Watch a Rewarded Ad! (i18n Ultimate Fallback)",
    rewardedAdDescription: "Watch this short video to earn a reward. (i18n Ultimate Fallback)",
    watchAdButton: "Watch Ad (i18n Ultimate Fallback)",
    rewardedAdBadge: "Rewarded Ad (i18n Ultimate Fallback)"
  },
  ThemeToggleSwitch: {
    switchToLightTheme: "Light (i18n Ultimate Fallback)",
    switchToDarkTheme: "Dark (i18n Ultimate Fallback)"
  },
  SavedAdsPage: {
    backToFeed: "Back to Feed (i18n Ultimate Fallback)",
    mySavedAds: "My Saved Ads (i18n Ultimate Fallback)",
    errorLoadingSavedAds: "Could not load saved ads. (i18n Ultimate Fallback)",
    infoToastTitle: "Info (i18n Ultimate Fallback)",
    personalizeInfoDescription: "Feed personalization is available on the main feed page. (i18n Ultimate Fallback)",
    unlikedAndRemovedToastDescription: "You unliked \"{title}\". It has been removed from your saved ads. (i18n Ultimate Fallback)",
    dislikedAndRemovedToastDescription: "You disliked \"{title}\". It has been removed from your saved ads. (i18n Ultimate Fallback)",
    noSavedAdsYet: "You haven't saved any ads yet. (i18n Ultimate Fallback)",
    likeAdToSave: "Like an ad in the main feed to save it here! (i18n Ultimate Fallback)"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo Banner (i18n Ultimate Fallback)",
    demoAdUnitId: "Demo Ad Unit ID: (i18n Ultimate Fallback)",
    placeholderText: "(This is a placeholder, not a live ad) (i18n Ultimate Fallback)"
  }
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is the default locale
  if (locale !== defaultLocale) {
    console.warn(`i18n.ts: Requested locale "${locale}" is not the default locale "${defaultLocale}". Providing default messages.`);
    // In a multi-locale setup, you might call notFound() or load the specific locale's messages.
    // For this simplified setup, we'll always aim to provide English messages.
  }

  let messages: AbstractIntlMessages;
  try {
    // Statically import English messages
    // The .default is often not needed for JSON imports with resolveJsonModule: true
    // but next-intl examples sometimes show it.
    messages = (enMessages as AbstractIntlMessages) || ultimateFallbackMessages;
    if (typeof messages !== 'object' || messages === null) {
        console.error("i18n.ts: Imported enMessages is not a valid object, using ultimate fallback.");
        messages = ultimateFallbackMessages;
    }
  } catch (error) {
    console.error('i18n.ts: Failed to load English messages statically, using ultimate fallback.', error);
    messages = ultimateFallbackMessages;
  }

  return {
    messages,
  };
});