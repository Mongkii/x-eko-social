
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {AbstractIntlMessages} from 'next-intl';

// Supported locales based on BRD (removed 'ru')
export const locales = ['en', 'ar', 'es', 'ur', 'fr', 'de', 'hi', 'zh', 'tl'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// --- Comprehensive Hardcoded English Fallback Messages ---
// This object is used if loading specific locale files fails or as the base for 'en'.
// It's derived from a complete en.json.
export const i18nUltimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Ameenee Marketplace",
    searchPlaceholder: "Search services, keywords...",
    allCategories: "All Categories",
    allServices: "All Services",
    loading: "Loading...",
    error: "An error occurred. Please try again.",
    goBack: "Go Back",
    submit: "Submit",
    bookNow: "Book Now",
    viewDetails: "View Details",
    priceLabel: "Price:",
    ratingLabel: "Rating:",
    reviewsCount: "{count, plural, =0 {No reviews} one {# review} other {# reviews}}",
    turnaroundTimeLabel: "Est. Turnaround:",
    login: "Log In",
    logout: "Log Out",
    profile: "Profile",
    dashboard: "Dashboard",
    adminPanel: "Admin Panel",
    actions: "Actions",
    save: "Save",
    cancel: "Cancel"
  },
  MarketplaceHomepage: {
    pageTitle: "Legal Services Marketplace",
    heroTitle: "Find Trusted Legal Advisors",
    heroSubtitle: "Access a global network of qualified professionals for your legal needs through Ameenee.",
    categoriesTitle: "Explore Service Categories",
    featuredServicesTitle: "Featured Services",
    howItWorksTitle: "How It Works",
    step1Browse: "1. Discover Services",
    step1Desc: "Browse categories or search for specific legal assistance.",
    step2Book: "2. Secure Booking",
    step2Desc: "Book your chosen service and complete payment securely.",
    step3Collaborate: "3. Collaborate & Track",
    step3Desc: "Work with your advisor and monitor progress via your dashboard."
  },
  ServiceListPage: {
    pageTitle: "{categoryName} Services",
    noServicesFound: "No services found in this category or matching your current filters.",
    filtersTitle: "Filters",
    priceRange: "Price Range",
    minRating: "Minimum Rating",
    providerLocation: "Provider Location",
    clearFilters: "Clear Filters",
    applyFilters: "Apply Filters"
  },
  ServiceDetailPage: {
    pageTitle: "{serviceTitle}",
    descriptionTitle: "Service Description",
    aboutProviderTitle: "About the Provider",
    reviewsTitle: "Client Reviews",
    bookThisService: "Book This Service",
    servicePrice: "Service Price",
    addToCart: "Add to Cart",
    proceedToBooking: "Proceed to Booking",
    uploadDocumentsPrompt: "Upload relevant documents (optional):",
    bookingConfirmationTitle: "Booking Initiated",
    bookingConfirmationDescription: "Your request for '{serviceTitle}' has been sent. You will be notified of the next steps. You can track your order in your dashboard."
  },
  ProviderProfilePage: {
    pageTitle: "{providerName}",
    memberSince: "Member since {date}",
    qualificationsTitle: "Qualifications & Credentials",
    specialtiesTitle: "Areas of Expertise",
    languagesSpokenTitle: "Languages Spoken",
    servicesOfferedTitle: "Services Offered by This Provider",
    clientReviewsTitle: "Client Reviews & Testimonials",
    contactProvider: "Contact Provider"
  },
  UserDashboardPage: {
    pageTitle: "My Dashboard",
    myOrdersTitle: "My Service Orders",
    orderId: "Order ID",
    serviceName: "Service",
    status: "Status",
    dateBooked: "Date Booked",
    noOrders: "You haven't booked any services yet. Explore the marketplace to get started!",
    viewOrder: "View Order"
  },
  ProviderOnboardingPage: {
    pageTitle: "Join Ameenee Marketplace as a Legal Advisor",
    formTitle: "Provider Application Form",
    fullNameLabel: "Full Name / Firm Name",
    emailLabel: "Contact Email",
    bioLabel: "Professional Bio / Firm Overview",
    licenseNumberLabel: "License Number(s) & Issuing Authority",
    qualificationsLabel: "Key Qualifications (e.g., JD, LLM, Bar Memberships - comma-separated)",
    serviceCategoriesLabel: "Select Service Categories You Offer",
    languagesSpokenLabel: "Languages Spoken (comma-separated)",
    countryLabel: "Country of Practice",
    cityLabel: "Primary City of Practice",
    applicationSubmittedTitle: "Application Submitted Successfully!",
    applicationSubmittedDescription: "Thank you for applying to become a provider on Ameenee Marketplace. Our team will review your application and contact you within 5-7 business days."
  },
  ProviderDashboardPage: {
    pageTitle: "Provider Dashboard",
    manageServices: "Manage My Services",
    activeOrders: "Active Orders",
    earnings: "Earnings & Payouts",
    myProfile: "My Provider Profile",
    availability: "Set Availability"
  },
  AdminLayout: {
    dashboard: "Dashboard",
    providers: "Provider Management",
    categories: "Category Management",
    orders: "Order Management",
    disputes: "Dispute Resolution"
  },
  AdminDashboardPage: {
    pageTitle: "Admin Dashboard Overview",
    totalRevenue: "Total Platform Revenue",
    activeProviders: "Active Providers",
    pendingApplications: "Pending Provider Applications",
    totalServices: "Total Active Services",
    totalOrders: "Total Orders Processed"
  },
  AdminProviderManagementPage: {
    pageTitle: "Provider Management",
    providerName: "Provider Name/Firm",
    email: "Email",
    status: "Status",
    joinedDate: "Joined Date",
    approve: "Approve",
    reject: "Reject",
    suspend: "Suspend",
    reinstate: "Reinstate",
    filterByStatus: "Filter by status...",
    allStatuses: "All Statuses",
    pending: "Pending",
    approved: "Approved",
    suspended: "Suspended",
    rejected: "Rejected",
    providerApprovedMsg: "Provider approved successfully.",
    providerRejectedMsg: "Provider rejected.",
    providerStatusUpdatedMsg: "Provider status updated."
  },
  AdminCategoryManagementPage: {
    pageTitle: "Service Category Management",
    categoryName: "Category Name (English)",
    categoryNameAr: "Category Name (Arabic)",
    description: "Description (English)",
    descriptionAr: "Description (Arabic)",
    isActive: "Active Status",
    edit: "Edit",
    addCategory: "Add New Category",
    categoryNameLabel: "Name (EN)",
    categoryNameArLabel: "Name (AR)",
    categoryDescriptionLabel: "Description (EN)",
    categoryDescriptionArLabel: "Description (AR)",
    saveCategory: "Save Category",
    categoryAddedMsg: "Category added successfully.",
    categoryUpdatedMsg: "Category updated successfully."
  },
  AppHeader: {
    appName: "Ameenee", // Short app name for header if different
    marketplace: "Marketplace",
    becomeProvider: "Become a Provider",
    admin: "Admin Panel",
    myDashboard: "My Dashboard",
    providerDashboard: "Provider Hub",
    settingsTooltip: "Settings",
    languageLabel: "Language", // For LanguageSwitcher DropdownItem
    themeLabel: "Theme / Appearance", // For ThemeToggle DropdownItem
    fontSizeLabel: "Font Size" // For FontSizeSwitcher DropdownItem
  },
  ThemeToggle: {
    themeLabel: "Theme", // Used by the ThemeToggle component in settings
    light: "Light",
    dark: "Dark",
    system: "System"
  },
  LanguageSwitcher: {
    selectLanguagePlaceholder: "Select Language",
    english: "English",
    arabic: "العربية",
    spanish: "Español",
    urdu: "اردو",
    french: "Français",
    german: "Deutsch",
    hindi: "हिन्दी",
    chinese: "中文",
    tagalog: "Tagalog"
    // Removed 'ru'
  },
  FontSizeSwitcher: {
    fontSizeLabel: "Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large"
  }
};
// --- End of Comprehensive Hardcoded English Fallback Messages ---


export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a valid defined locale
  if (!locales.includes(locale as Locale)) {
    console.warn(`i18n.ts: Unsupported locale "${locale}" requested in getRequestConfig. Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;

  if (locale === defaultLocale) {
    // For English, always use the comprehensive hardcoded fallback to ensure stability.
    console.log(`i18n.ts: Using i18nUltimateFallbackMessages for default locale "${locale}".`);
    messages = JSON.parse(JSON.stringify(i18nUltimateFallbackMessages)); // Use a deep clone
  } else {
    // For other locales, attempt to load their specific message file.
    try {
      const localeMessagesModule = await import(`./messages/${locale}.json`);
      messages = localeMessagesModule.default;

      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Falling back to i18nUltimateFallbackMessages (English).`);
        messages = JSON.parse(JSON.stringify(i18nUltimateFallbackMessages)); // Use a deep clone
      } else {
        console.log(`i18n.ts: Successfully loaded messages for locale "${locale}".`);
      }
    } catch (error) {
      console.error(`i18n.ts: Failed to load messages for locale "${locale}". Error:`, error, `Falling back to i18nUltimateFallbackMessages (English).`);
      messages = JSON.parse(JSON.stringify(i18nUltimateFallbackMessages)); // Use a deep clone
    }
  }
  
  return {
    messages
  };
});
