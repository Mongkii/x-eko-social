import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

// Define your supported locales based on BRD V1 (English & Arabic)
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Fallback messages (English) - ensure all keys from en.json are here.
export const i18nUltimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Ameenee Marketplace",
    search: "Search",
    searchPlaceholder: "Search for legal services...",
    viewAll: "View All",
    loading: "Loading...",
    error: "An error occurred.",
    goBack: "Go Back",
    submit: "Submit",
    save: "Save",
    cancel: "Cancel",
    bookNow: "Book Now",
    sendMessage: "Send Message",
    readMore: "Read More",
    readLess: "Read Less",
    requiredField: "This field is required.",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusSuspended: "Suspended",
    viewDetails: "View Details",
    reviews: "reviews",
  },
  AppHeader: {
    appName: "Ameenee",
    home: "Home",
    services: "Services",
    becomeAProvider: "Become a Provider",
    dashboard: "Dashboard",
    admin: "Admin",
    login: "Login",
    logout: "Logout",
    settings: "Settings",
    theme: "Theme",
    fontSize: "Font Size",
    language: "Language",
    providerDashboard: "Provider Area",
  },
  AppFooter: {
    copyright: "© {year} Ameenee Marketplace. All rights reserved.",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    faq: "FAQ",
  },
  HomePage: {
    heroTitle: "Find Trusted Legal Services, Globally.",
    heroSubtitle: "Your partner for accessible and reliable legal expertise.",
    categoriesTitle: "Service Categories",
    featuredServicesTitle: "Featured Services",
    howItWorksTitle: "How It Works",
    step1Title: "Browse Services",
    step1Description: "Explore categories or search for specific legal needs.",
    step2Title: "Book Securely",
    step2Description: "Choose a provider, upload documents, and pay securely.",
    step3Title: "Track Progress",
    step3Description: "Monitor your service progress and communicate with your advisor.",
    becomeProviderTitle: "Are you a Legal Advisor?",
    becomeProviderAction: "Join Our Network",
  },
  ServiceListingPage: {
    pageTitleAllServices: "All Legal Services",
    pageTitleInCategory: "Services in {categoryName}",
    noServicesFound: "No services found matching your criteria.",
    filterByPrice: "Filter by Price",
    filterByRating: "Filter by Rating",
    filterByLocation: "Filter by Location (Coming Soon)",
    allCategories: "All Categories",
  },
  ServiceDetailPage: {
    overview: "Overview",
    aboutProvider: "About the Provider",
    providerDetails: "Provider Details",
    reviews: "Reviews ({count})",
    bookThisService: "Book This Service",
    price: "Price:",
    turnaroundTime: "Estimated Turnaround:",
    noReviewsYet: "No reviews yet for this service.",
    loginToBook: "Please login to book this service.",
    bookingSuccessTitle: "Booking Initiated!",
    bookingSuccessDescription: "Your service request has been sent. You will be notified once the provider accepts.",
    bookingErrorTitle: "Booking Failed",
    bookingErrorDescription: "Could not initiate booking. Please try again.",
    viewProviderProfile: "View Provider Profile",
    writeReview: "Write a Review",
    yourRating: "Your Rating",
    yourReview: "Your Review",
    submitReview: "Submit Review",
    reviewSubmitted: "Review Submitted!",
    reviewSubmitError: "Error submitting review.",
  },
  ProviderProfilePage: {
    memberSince: "Member Since {date}",
    languagesSpoken: "Languages Spoken:",
    qualifications: "Qualifications:",
    servicesOffered: "Services Offered:",
    overallRating: "Overall Rating:",
    contactProvider: "Contact Provider",
    noServicesOffered: "This provider currently offers no services.",
    averageResponseTime: "Avg. Response Time:",
    responseRate: "Response Rate:",
    reviews: "Reviews",
  },
  UserDashboardPage: {
    pageTitle: "My Dashboard",
    myOrders: "My Orders",
    myDocuments: "My Documents (Coming Soon)",
    accountSettings: "Account Settings",
    noOrdersYet: "You haven't booked any services yet.",
    orderId: "Order ID",
    service: "Service",
    dateBooked: "Date Booked",
    status: "Status",
    action: "Action",
    viewOrder: "View Order",
  },
  ProviderOnboardingPage: {
    pageTitle: "Become a Provider on Ameenee Marketplace",
    formTitle: "Provider Application Form",
    fullNameLabel: "Full Name / Firm Name",
    emailLabel: "Contact Email",
    bioLabel: "Biography / Firm Overview (Min 50 characters)",
    licenseNumberLabel: "License Number & Issuing Authority",
    qualificationsLabel: "Key Qualifications (e.g., JD, LLM, Bar Admission)",
    serviceCategoriesLabel: "Service Categories You Offer",
    languagesSpokenLabel: "Languages Spoken (e.g., English, Arabic)",
    countryLabel: "Country of Practice",
    cityLabel: "Primary City of Practice",
    agreeToTermsLabel: "I agree to the <termsLink>Terms & Conditions</termsLink> and <privacyLink>Privacy Policy</privacyLink> of Ameenee Marketplace.",
    applicationSubmittedTitle: "Application Submitted!",
    applicationSubmittedDescription: "Thank you for applying. Our team will review your application and contact you.",
    applicationErrorTitle: "Application Error",
    applicationErrorDescription: "Failed to submit application. Please check your input and try again.",
    selectCategoriesPlaceholder: "Select categories",
    selectLanguagesPlaceholder: "Select languages",
    selectCountryPlaceholder: "Select country",
  },
  ProviderDashboardPage: {
    pageTitle: "Provider Dashboard",
    manageServices: "Manage My Services",
    activeOrders: "Active Orders",
    earnings: "Earnings",
    profileSettings: "Profile Settings",
    availability: "Availability Calendar",
    noActiveOrders: "No active orders at the moment.",
    addNewService: "Add New Service",
  },
  AdminLayout: {
    adminPanelTitle: "Ameenee Admin",
    dashboard: "Dashboard",
    providerManagement: "Providers",
    categoryManagement: "Categories",
    disputeResolution: "Disputes",
    settings: "Settings",
    backToMarketplace: "Back to Marketplace",
  },
  AdminDashboardPage: {
    pageTitle: "Admin Analytics Dashboard",
    description: "Overview of marketplace performance and key metrics.",
    totalUsers: "Total Users",
    totalProviders: "Total Providers",
    totalServices: "Total Services",
    totalRevenue: "Total Revenue",
    recentTransactions: "Recent Transactions",
  },
  AdminProvidersPage: {
    pageTitle: "Provider Management",
    description: "Approve, reject, or suspend service provider applications and manage existing providers.",
    providerNameHeader: "Provider Name",
    statusHeader: "Status",
    locationHeader: "Location",
    memberSinceHeader: "Member Since",
    actionsHeader: "Actions",
    approveAction: "Approve",
    rejectAction: "Reject",
    suspendAction: "Suspend",
    reinstateAction: "Reinstate",
    providerStatusUpdated: "Provider {providerId} status updated to {status}.",
    errorUpdatingProvider: "Error updating provider status.",
    actionSuccessTitle: "Success",
    actionErrorTitle: "Error",
    noProvidersFound: "No providers found.",
  },
  AdminCategoriesPage: {
    pageTitle: "Category Management",
    description: "Manage service categories for the marketplace.",
    addNewCategory: "Add New Category",
    editCategory: "Edit Category",
    categoryNameEnLabel: "Category Name (English)",
    categoryNameArLabel: "Category Name (Arabic)",
    categoryDescriptionEnLabel: "Description (English)",
    categoryDescriptionArLabel: "Description (Arabic)",
    categoryIsActiveLabel: "Is Active",
    categoryImageUrlLabel: "Image URL (Optional)",
    categorySavedSuccess: "Category saved successfully.",
    categorySaveError: "Failed to save category.",
    categoryDeleteConfirmTitle: "Confirm Action",
    categoryDeleteConfirmText: "Are you sure you want to update the status of this category?",
    categoryDeletedSuccess: "Category status updated.",
    categoryDeleteError: "Failed to update category status.",
    noCategoriesFound: "No categories found.",
    actions: "Actions",
    editCategoryDescription: "Update the details of this category.",
    addNewCategoryDescription: "Fill in the details for the new category.",
    fetchErrorTitle: "Error",
    fetchErrorDescription: "Could not fetch categories.",
  },
  ThemeToggle: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  FontSizeSwitcher: {
    small: "Small",
    medium: "Medium",
    large: "Large",
  },
  LanguageSwitcher: {
    selectLanguage: "Language",
  },
  CategoryCard: {
    // No specific keys needed if name/description come from category object
  },
  ServiceCard: {
    // No specific keys needed if title/description come from service object
  },
};

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a valid locale
  if (!locales.includes(locale as any)) {
    console.warn(`i18n.ts: Invalid locale "${locale}" requested from URL params. Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    if (locale === defaultLocale) {
      // For default locale (en), use the statically defined ultimate fallback
      // This avoids dynamic import for the most common case and ensures it's always available.
      messages = i18nUltimateFallbackMessages;
      // console.log(`i18n.ts: Using statically defined ultimateFallbackMessages for default locale "${locale}".`);
    } else {
      // For other locales, attempt to dynamically import their message file
      // console.log(`i18n.ts: Attempting to dynamically import messages for locale "${locale}".`);
      const localeMessages = (await import(`./messages/${locale}.json`)).default;
      if (!localeMessages || typeof localeMessages !== 'object' || Object.keys(localeMessages).length === 0) {
        console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Using ultimate English fallback messages.`);
        messages = i18nUltimateFallbackMessages;
      } else {
        messages = localeMessages;
      }
    }
  } catch (error) {
    console.error(`i18n.ts: Could not load messages for locale "${locale}". Error: ${error}. Using ultimate English fallback messages.`);
    messages = i18nUltimateFallbackMessages;
  }
  
  // Final check: If after all attempts, messages are still critically empty, then 404.
  // This should ideally not happen if i18nUltimateFallbackMessages is correctly defined.
  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
    console.error(`i18n.ts: CRITICAL - Messages for locale "${locale}" are still empty even after all fallbacks. This indicates a severe issue. Propagating notFound.`);
    notFound();
  }

  return {
    messages: messages as AbstractIntlMessages,
  };
});
