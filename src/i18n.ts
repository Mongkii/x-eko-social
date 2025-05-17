
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';
import enMessages from './messages/en.json'; // Static import for default locale

export const locales = ['en'];
export const defaultLocale = 'en';

// A minimal set of messages to ensure the app can render if en.json is problematic
const minimalHardcodedEnglishMessages: AbstractIntlMessages = {
  Global: { appName: "Shopyme (i18n Fallback)" },
  HomePage: { greeting: "Welcome (i18n Fallback)" },
  AppHeader: { 
    shopyme: "Shopyme (i18n Fallback)",
    savedAdsTooltip: "Saved Ads (i18n Fallback)",
    personalizeFeedTooltip: "Personalize (i18n Fallback)"
  },
  FeedItemCard: { 
    adBadge: "Ad (i18n Fallback)",
    sponsoredBy: "Sponsored by (i18n Fallback)",
    categoriesLabel: "Categories (i18n Fallback)",
    rateThisAdLabel: "Rate this ad (i18n Fallback)",
    rateThisContentLabel: "Rate this content (i18n Fallback)",
    dislikeAction: "Dislike (i18n Fallback)",
    likeAction: "Like (i18n Fallback)",
    commentAction: "Comment (i18n Fallback)",
    shareAction: "Share (i18n Fallback)",
    shareOnFacebook: "Share on Facebook (i18n Fallback)",
    shareOnTwitter: "Share on Twitter (i18n Fallback)",
    shareOnInstagram: "Share on Instagram (i18n Fallback)",
    rewardedAdTitle: "Watch Ad! (i18n Fallback)",
    rewardedAdDescription: "Watch video for reward. (i18n Fallback)",
    watchAdButton: "Watch Ad (i18n Fallback)",
    rewardedAdBadge: "Rewarded Ad (i18n Fallback)"
   },
  ThemeToggleSwitch: {
    switchToLightTheme: "Light Mode (i18n Fallback)",
    switchToDarkTheme: "Dark Mode (i18n Fallback)"
  },
  SavedAdsPage: {
    backToFeed: "Back to Feed (i18n Fallback)",
    mySavedAds: "My Saved Ads (i18n Fallback)"
  },
  AdMobBanner: {
    demoBannerTitle: "AdMob Demo (i18n Fallback)",
    demoAdUnitId: "Demo Ad Unit ID (i18n Fallback):",
    placeholderText: "(Placeholder ad) (i18n Fallback)"
  }
};

// Using a synchronous getRequestConfig for simplicity with a single, statically imported locale
export default getRequestConfig(({locale}) => {
  // This app is English-only for now.
  // The middleware should ensure only 'en' is passed.
  if (locale !== 'en') {
    console.warn(`i18n.ts: Unexpected locale "${locale}" received. Defaulting to 'en' messages.`);
  }

  let messagesToUse: AbstractIntlMessages;
  try {
    // Check if enMessages (from static import) is a valid object
    if (typeof enMessages === 'object' && enMessages !== null && Object.keys(enMessages).length > 0) {
      messagesToUse = enMessages as AbstractIntlMessages;
      // console.log("i18n.ts: Successfully using statically imported en.json.");
    } else {
      console.error("i18n.ts: Statically imported en.json is invalid or empty. Using minimal hardcoded English messages.");
      messagesToUse = minimalHardcodedEnglishMessages;
    }
  } catch (error) {
    console.error("i18n.ts: Error processing en.json. Using minimal hardcoded English messages. Details:", error);
    messagesToUse = minimalHardcodedEnglishMessages;
  }
  
  return {
    messages: messagesToUse
  };
});
