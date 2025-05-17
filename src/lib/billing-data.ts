
import type { InAppPurchaseItem } from '@/lib/types';

export const premiumSubscriptionSku = "premium_monthly_01";

export const mockInAppPurchaseItems: InAppPurchaseItem[] = [
  {
    id: premiumSubscriptionSku,
    title: "Premium Subscription",
    description: "Unlock all features and remove ads.",
    price: "$9.99/month",
    type: 'subscription',
  },
  {
    id: "remove_ads_one_time",
    title: "Remove Ads (One-Time)",
    description: "Enjoy an ad-free experience forever.",
    price: "$19.99",
    type: 'one-time',
  },
  {
    id: "feature_pack_small",
    title: "Small Feature Pack",
    description: "Get a bundle of extra features.",
    price: "$4.99",
    type: 'one-time',
  },
];
