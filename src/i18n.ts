
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { AbstractIntlMessages } from 'next-intl';

// V1 Scope: English and Arabic
export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Define a comprehensive fallback structure matching en.json
// This will be used if a specific locale file is missing or corrupt.
const i18nUltimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Ameenee Marketplace (Fallback)",
    searchPlaceholder: "Search services, keywords... (Fallback)",
    allCategories: "All Categories (Fallback)",
    allServices: "All Services (Fallback)",
    loading: "Loading... (Fallback)",
    error: "An error occurred. Please try again. (Fallback)",
    goBack: "Go Back (Fallback)",
    submit: "Submit (Fallback)",
    bookNow: "Book Now (Fallback)",
    viewDetails: "View Details (Fallback)",
    priceLabel: "Price: (Fallback)",
    ratingLabel: "Rating: (Fallback)",
    reviewsCount: "{count, plural, =0 {No reviews} one {# review} other {# reviews}} (Fallback)",
    turnaroundTimeLabel: "Est. Turnaround: (Fallback)",
    login: "Log In (Fallback)",
    logout: "Log Out (Fallback)",
    profile: "Profile (Fallback)",
    dashboard: "Dashboard (Fallback)",
    adminPanel: "Admin Panel (Fallback)",
    actions: "Actions (Fallback)",
    save: "Save (Fallback)",
    cancel: "Cancel (Fallback)"
  },
  MarketplaceHomepage: {
    pageTitle: "Legal Services Marketplace (Fallback)",
    heroTitle: "Find Trusted Legal Advisors (Fallback)",
    heroSubtitle: "Access a global network of qualified professionals for your legal needs through Ameenee. (Fallback)",
    categoriesTitle: "Explore Service Categories (Fallback)",
    featuredServicesTitle: "Featured Services (Fallback)",
    howItWorksTitle: "How It Works (Fallback)",
    step1Browse: "1. Discover Services (Fallback)",
    step1Desc: "Browse categories or search for specific legal assistance. (Fallback)",
    step2Book: "2. Secure Booking (Fallback)",
    step2Desc: "Book your chosen service and complete payment securely. (Fallback)",
    step3Collaborate: "3. Collaborate & Track (Fallback)",
    step3Desc: "Work with your advisor and monitor progress via your dashboard. (Fallback)"
  },
  ServiceListPage: {
    pageTitle: "{categoryName} Services (Fallback)",
    noServicesFound: "No services found in this category or matching your current filters. (Fallback)",
    filtersTitle: "Filters (Fallback)",
    priceRange: "Price Range (Fallback)",
    minRating: "Minimum Rating (Fallback)",
    providerLocation: "Provider Location (Fallback)",
    clearFilters: "Clear Filters (Fallback)",
    applyFilters: "Apply Filters (Fallback)"
  },
  ServiceDetailPage: {
    pageTitle: "{serviceTitle} (Fallback)",
    descriptionTitle: "Service Description (Fallback)",
    aboutProviderTitle: "About the Provider (Fallback)",
    reviewsTitle: "Client Reviews (Fallback)",
    bookThisService: "Book This Service (Fallback)",
    servicePrice: "Service Price (Fallback)",
    addToCart: "Add to Cart (Fallback)",
    proceedToBooking: "Proceed to Booking (Fallback)",
    uploadDocumentsPrompt: "Upload relevant documents (optional): (Fallback)",
    bookingConfirmationTitle: "Booking Initiated (Fallback)",
    bookingConfirmationDescription: "Your request for '{serviceTitle}' has been sent. You will be notified of the next steps. You can track your order in your dashboard. (Fallback)"
  },
  ProviderProfilePage: {
    pageTitle: "{providerName} (Fallback)",
    memberSince: "Member since {date} (Fallback)",
    qualificationsTitle: "Qualifications & Credentials (Fallback)",
    specialtiesTitle: "Areas of Expertise (Fallback)",
    languagesSpokenTitle: "Languages Spoken (Fallback)",
    servicesOfferedTitle: "Services Offered by This Provider (Fallback)",
    clientReviewsTitle: "Client Reviews & Testimonials (Fallback)",
    contactProvider: "Contact Provider (Fallback)"
  },
  UserDashboardPage: {
    pageTitle: "My Dashboard (Fallback)",
    myOrdersTitle: "My Service Orders (Fallback)",
    orderId: "Order ID (Fallback)",
    serviceName: "Service (Fallback)",
    status: "Status (Fallback)",
    dateBooked: "Date Booked (Fallback)",
    noOrders: "You haven't booked any services yet. Explore the marketplace to get started! (Fallback)",
    viewOrder: "View Order (Fallback)"
  },
  ProviderOnboardingPage: {
    pageTitle: "Join Ameenee Marketplace as a Legal Advisor (Fallback)",
    formTitle: "Provider Application Form (Fallback)",
    fullNameLabel: "Full Name / Firm Name (Fallback)",
    emailLabel: "Contact Email (Fallback)",
    bioLabel: "Professional Bio / Firm Overview (Fallback)",
    licenseNumberLabel: "License Number(s) & Issuing Authority (Fallback)",
    qualificationsLabel: "Key Qualifications (e.g., JD, LLM, Bar Memberships - comma-separated) (Fallback)",
    serviceCategoriesLabel: "Select Service Categories You Offer (Fallback)",
    languagesSpokenLabel: "Languages Spoken (comma-separated) (Fallback)",
    countryLabel: "Country of Practice (Fallback)",
    cityLabel: "Primary City of Practice (Fallback)",
    applicationSubmittedTitle: "Application Submitted Successfully! (Fallback)",
    applicationSubmittedDescription": "Thank you for applying to become a provider on Ameenee Marketplace. Our team will review your application and contact you within 5-7 business days. (Fallback)"
  },
  ProviderDashboardPage: {
    pageTitle: "Provider Dashboard (Fallback)",
    manageServices: "Manage My Services (Fallback)",
    activeOrders: "Active Orders (Fallback)",
    earnings: "Earnings & Payouts (Fallback)",
    myProfile: "My Provider Profile (Fallback)",
    availability: "Set Availability (Fallback)"
  },
  AdminLayout: {
    dashboard: "Dashboard (Fallback)",
    providers: "Provider Management (Fallback)",
    categories: "Category Management (Fallback)",
    orders: "Order Management (Fallback)",
    disputes: "Dispute Resolution (Fallback)"
  },
  AdminDashboardPage: {
    pageTitle: "Admin Dashboard Overview (Fallback)",
    totalRevenue: "Total Platform Revenue (Fallback)",
    activeProviders: "Active Providers (Fallback)",
    pendingApplications: "Pending Provider Applications (Fallback)",
    totalServices: "Total Active Services (Fallback)",
    totalOrders: "Total Orders Processed (Fallback)"
  },
  AdminProviderManagementPage: {
    pageTitle: "Provider Management (Fallback)",
    providerName: "Provider Name/Firm (Fallback)",
    email: "Email (Fallback)",
    status: "Status (Fallback)",
    joinedDate: "Joined Date (Fallback)",
    approve: "Approve (Fallback)",
    reject: "Reject (Fallback)",
    suspend: "Suspend (Fallback)",
    reinstate: "Reinstate (Fallback)",
    filterByStatus: "Filter by status... (Fallback)",
    allStatuses: "All Statuses (Fallback)",
    pending: "Pending (Fallback)",
    approved: "Approved (Fallback)",
    suspended: "Suspended (Fallback)",
    rejected: "Rejected (Fallback)",
    providerApprovedMsg: "Provider approved successfully. (Fallback)",
    providerRejectedMsg: "Provider rejected. (Fallback)",
    providerStatusUpdatedMsg": "Provider status updated. (Fallback)"
  },
  AdminCategoryManagementPage: {
    pageTitle: "Service Category Management (Fallback)",
    categoryName: "Category Name (English) (Fallback)",
    categoryNameAr: "Category Name (Arabic) (Fallback)",
    description: "Description (English) (Fallback)",
    descriptionAr: "Description (Arabic) (Fallback)",
    isActive: "Active Status (Fallback)",
    edit: "Edit (Fallback)",
    addCategory: "Add New Category (Fallback)",
    categoryNameLabel": "Name (EN) (Fallback)",
    categoryNameArLabel": "Name (AR) (Fallback)",
    categoryDescriptionLabel": "Description (EN) (Fallback)",
    categoryDescriptionArLabel": "Description (AR) (Fallback)",
    saveCategory: "Save Category (Fallback)",
    categoryAddedMsg": "Category added successfully. (Fallback)",
    categoryUpdatedMsg": "Category updated successfully. (Fallback)"
  },
  AppHeader: {
    marketplace: "Marketplace (Fallback)",
    becomeProvider: "Become a Provider (Fallback)",
    admin: "Admin Panel (Fallback)",
    myDashboard: "My Dashboard (Fallback)",
    providerDashboard: "Provider Hub (Fallback)",
    settingsTooltip: "Settings (Fallback)",
    languageLabel: "Language (Fallback)",
    themeLabel: "Theme / Appearance (Fallback)"
  },
  ThemeToggle: {
    themeLabel: "Theme (Fallback)",
    light: "Light (Fallback)",
    dark: "Dark (Fallback)",
    system: "System (Fallback)"
  },
  LanguageSwitcher: {
    selectLanguagePlaceholder: "Select Language (Fallback)",
    english: "English (Fallback)",
    arabic: "العربية (Fallback)",
    spanish: "Español (Fallback)",
    urdu: "اردو (Fallback)",
    french: "Français (Fallback)",
    german: "Deutsch (Fallback)",
    hindi: "हिन्दी (Fallback)",
    chinese: "中文 (Fallback)",
    tagalog: "Tagalog (Fallback)"
  }
};


export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;
  try {
    const localeMessagesModule = await import(`./messages/${locale}.json`);
    messages = localeMessagesModule.default;

    if (!messages || Object.keys(messages).length === 0) {
      console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Using ultimate English fallback.`);
      messages = i18nUltimateFallbackMessages;
    }
  } catch (error) {
    console.error(`i18n.ts: Failed to load messages for locale "${locale}". Error:`, error, `Using ultimate English fallback.`);
    messages = i18nUltimateFallbackMessages;
  }

  return {
    messages
  };
});
