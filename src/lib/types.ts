
import type { AbstractIntlMessages } from 'next-intl';

// Based on BRD: marketplace.categories
export interface MarketplaceCategory {
  id: string; // category_id
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active: boolean;
  imageUrl?: string; 
  dataAiHint?: string; // For placeholder image generation hints
}

// Based on BRD: marketplace.services
export interface MarketplaceService {
  id: string; // service_id
  provider_id: string; // Reference to providers collection
  category_id: string; // Reference to categories collection
  
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  
  price: number;
  currency: string; // e.g., "SAR", "USD"
  turnaround_time_en?: string; // e.g., "2-3 business days"
  turnaround_time_ar?: string;

  avg_rating?: number;
  review_count?: number;

  main_image_url?: string;
  dataAiHint?: string; // For placeholder image generation hints

  // Denormalized provider info for easier listing - useful for service cards
  provider_name?: string; // Could be firm name or individual
  provider_avatar_url?: string;
  dataAiHintProvider?: string;
}

// Based on BRD: providers
export interface LegalProvider {
  id: string; // provider_id
  user_id: string; // Reference to a general users collection if exists, or auth UID
  name: string; // Full name or Firm name
  bio_en?: string;
  bio_ar?: string;
  avatar_url?: string;
  dataAiHint?: string;
  license_number?: string; 
  qualifications?: string[]; // e.g., ["JD", "LLM in International Law", "Bar Member (Riyadh)"]
  service_category_ids?: string[]; // Array of category_ids they serve
  languages_spoken?: string[]; // e.g., ['en', 'ar', 'fr']
  response_rate?: number; // Percentage e.g., 95
  avg_response_time_hrs?: number; // e.g., 24 (for "Within 24 hours")
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  country_code?: string; // e.g., "SA"
  city?: string;
  overall_rating?: number;
  total_reviews?: number;
  member_since?: string; // ISO Date string
}

// Based on BRD: orders
export interface MarketplaceOrder {
  id: string; // order_id
  user_id: string; // Ameenee User ID
  service_id: string;
  provider_id: string;
  
  service_title_en?: string; // Denormalized for display
  service_title_ar?: string; // Denormalized for display
  
  status: 'pending_payment' | 'pending_acceptance' | 'in_progress' | 'awaiting_documents' | 'completed' | 'cancelled_by_user' | 'cancelled_by_provider' | 'disputed';
  created_at: string; // ISO Date string (Firebase Timestamp in backend)
  updated_at?: string; // ISO Date string
  
  price_paid?: number;
  currency_paid?: string;
  payment_id?: string; // e.g., Stripe Charge ID
}

export interface ServiceReview {
  id: string; // review_id (could be same as order_id if 1 review per order)
  order_id: string;
  service_id: string;
  user_id: string;
  provider_id: string;
  user_name?: string; // Denormalized
  user_avatar_url?: string; // Denormalized
  dataAiHintUser?: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string; // ISO Date string
}

// Simplified User for frontend simulation
export interface User {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  dataAiHint?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  isProvider?: boolean;
  providerId?: string; // If isProvider is true
}

// For next-intl messages
export interface Messages extends AbstractIntlMessages {}
