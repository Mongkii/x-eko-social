
import type { InAppPurchaseItem } from '@/lib/types';

export const premiumSubscriptionSku = "eko_plus_monthly"; // As per BRD examples

export const mockInAppPurchaseItems: InAppPurchaseItem[] = [
  {
    id: premiumSubscriptionSku,
    title: "Eko+ Subscription",
    description: "Unlock all premium features, ad-free listening, and more.",
    price: "$4.99/month", // Example price
    type: 'subscription',
  },
  {
    id: "eko_ad_free_permanent",
    title: "Ad-Free (Permanent)",
    description: "Remove all ads from your Eko experience forever.",
    price: "$19.99",
    type: 'one-time',
  },
  {
    id: "eko_extra_storage_tier1",
    title: "Extra Storage (Tier 1)",
    description: "Get more storage for your EkoDrops.",
    price: "$1.99",
    type: 'one-time', // Could also be a recurring consumable
  },
];
