
import type { InAppPurchaseItem } from './types';

export const premiumSubscriptionSku = "eko_plus_premium_monthly";

export const mockInAppPurchaseItems: InAppPurchaseItem[] = [
  {
    sku: premiumSubscriptionSku,
    title_en: "Eko+ Premium Monthly",
    title_ar: "اشتراك إيكو+ بريميوم شهري",
    description_en: "Ad-free listening, exclusive content, and early access features.",
    description_ar: "استماع خالٍ من الإعلانات، محتوى حصري، وميزات وصول مبكر.",
    price: "$4.99/month", // This is for display; actual price comes from store
    type: "subscription",
  },
  {
    sku: "eko_remove_ads_one_time",
    title_en: "Remove Ads Forever",
    title_ar: "إزالة الإعلانات للأبد",
    description_en: "A one-time purchase to remove all ads from your Eko experience.",
    description_ar: "شراء لمرة واحدة لإزالة جميع الإعلانات من تجربة إيكو الخاصة بك.",
    price: "$9.99", // Display price
    type: "consumable", // Or non-consumable depending on how it's managed
  },
  {
    sku: "eko_voice_filter_pack_1",
    title_en: "Voice Filter Pack 1",
    title_ar: "حزمة فلاتر الصوت 1",
    description_en: "Unlock 5 new fun voice filters for your EkoDrops!",
    description_ar: "افتح 5 فلاتر صوتية ممتعة جديدة لإيكو دروبس الخاصة بك!",
    price: "$1.99",
    type: "consumable", // Typically voice filters or cosmetic items are consumables
  }
];
