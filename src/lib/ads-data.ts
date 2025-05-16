
import type { FeedItemData } from '@/lib/types';

const SAMPLE_VIDEO_URL = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

export const initialFeedItems: FeedItemData[] = [
  { id: '1', type: 'content', sourceUrl: 'https://placehold.co/600x600.png', dataAiHint: 'travel landscape', title: 'Amazing Mountain View', description: 'Exploring the serene beauty of the mountains.', categories: ['Travel', 'Nature'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '2', type: 'ad', sourceUrl: 'https://placehold.co/600x600.png', videoUrl: SAMPLE_VIDEO_URL, dataAiHint: 'fashion clothing', title: 'New Summer Collection!', advertiser: 'FashionBrandX', description: 'Get ready for summer with our new arrivals. Up to 50% off!', categories: ['Fashion', 'Shopping'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '3', type: 'content', sourceUrl: 'https://placehold.co/600x600.png', dataAiHint: 'food recipe', title: 'Delicious Pasta Recipe', description: 'Learn how to make this simple and tasty pasta dish.', categories: ['Food', 'Cooking'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '4', type: 'ad', sourceUrl: 'https://placehold.co/600x600.png', videoUrl: SAMPLE_VIDEO_URL, dataAiHint: 'electronics gadget', title: 'Latest Smartphone Pro', advertiser: 'TechGiant', description: 'Experience the future with the new Smartphone Pro. Pre-order now!', categories: ['Electronics', 'Tech'], userRating: 0, isLiked: false, isDisliked: false },
  { id: '5', type: 'content', sourceUrl: 'https://placehold.co/600x600.png', dataAiHint: 'sports game', title: 'Epic Soccer Match Highlights', description: 'Relive the best moments from yesterday\'s game.', categories: ['Sports', 'Soccer'], userRating: 0, isLiked: false, isDisliked: false },
];

// Mock list of all available ads for personalization
export const allAvailableAds: FeedItemData[] = [
  ...initialFeedItems.filter(item => item.type === 'ad'),
  { id: 'ad101', type: 'ad', sourceUrl: 'https://placehold.co/600x600.png', videoUrl: SAMPLE_VIDEO_URL, dataAiHint: 'gaming console', title: 'Next-Gen Gaming Console', advertiser: 'GameWorld', description: 'Immerse yourself in ultra-realistic gaming.', categories: ['Gaming', 'Electronics'], userRating: 0, isLiked: false, isDisliked: false },
  { id: 'ad102', type: 'ad', sourceUrl: 'https://placehold.co/600x600.png', videoUrl: SAMPLE_VIDEO_URL, dataAiHint: 'travel destination', title: 'Dream Vacation Package', advertiser: 'TravelDreams', description: 'Book your dream vacation today at an unbeatable price.', categories: ['Travel', 'Deals'], userRating: 0, isLiked: false, isDisliked: false },
  { id: 'ad103', type: 'ad', sourceUrl: 'https://placehold.co/600x600.png', videoUrl: SAMPLE_VIDEO_URL, dataAiHint: 'food delivery', title: 'Quick Food Delivery', advertiser: 'SpeedyEats', description: 'Hungry? Get your favorite meals delivered in minutes.', categories: ['Food', 'Services'], userRating: 0, isLiked: false, isDisliked: false },
];
