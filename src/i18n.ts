
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

// Define your supported locales based on BRD V1 (English & Arabic)
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Define a comprehensive fallback message object directly in this file for English.
// This structure should mirror your en.json to ensure all keys are present.
// This will be used if a specific locale's file is missing or corrupt.
export const i18nUltimateFallbackMessages: AbstractIntlMessages = {
  Global: {
    appName: "Ameenee Marketplace",
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
    // Common status
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusSuspended: "Suspended",
  },
  AppHeader: {
    appName: "Ameenee Marketplace",
    home: "Home",
    services: "Services",
    becomeAProvider: "Become a Provider",
    dashboard: "Dashboard",
    admin: "Admin Panel",
    login: "Login",
    logout: "Logout",
    settings: "Settings",
    theme: "Theme",
    fontSize: "Font Size",
    language: "Language",
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
  ServiceListingPage: { // For /services and /services/[categoryId]
    pageTitleAllServices: "All Legal Services",
    pageTitleInCategory: "Services in {categoryName}",
    noServicesFound: "No services found matching your criteria.",
    filterByPrice: "Filter by Price",
    filterByRating: "Filter by Rating",
    filterByLocation: "Filter by Location (Coming Soon)",
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
  },
  ProviderProfilePage: {
    memberSince: "Member Since {date}",
    languagesSpoken: "Languages Spoken:",
    qualifications: "Qualifications:",
    servicesOffered: "Services Offered:",
    overallRating: "Overall Rating:",
    contactProvider: "Contact Provider",
  },
  UserDashboardPage: {
    pageTitle: "My Dashboard",
    myOrders: "My Orders",
    myDocuments: "My Documents (Coming Soon)",
    accountSettings: "Account Settings",
    noOrdersYet: "You haven't booked any services yet.",
  },
  ProviderOnboardingPage: {
    pageTitle: "Become a Provider on Ameenee Marketplace",
    formTitle: "Provider Application Form",
    fullNameLabel: "Full Name / Firm Name",
    emailLabel: "Contact Email",
    bioLabel: "Biography / Firm Overview",
    licenseNumberLabel: "License Number & Issuing Authority",
    qualificationsLabel: "Key Qualifications (comma-separated)",
    serviceCategoriesLabel: "Service Categories You Offer",
    languagesSpokenLabel: "Languages Spoken (comma-separated)",
    countryLabel: "Country of Practice",
    cityLabel: "Primary City of Practice",
    agreeToTermsLabel: "I agree to the <termsLink>Terms & Conditions</termsLink> and <privacyLink>Privacy Policy</privacyLink> of Ameenee Marketplace.",
    applicationSubmittedTitle: "Application Submitted Successfully!",
    applicationSubmittedDescription: "Thank you for applying. Our team will review your application and contact you.",
    applicationErrorTitle: "Application Error",
    applicationErrorDescription: "Failed to submit application. Please try again.",
  },
  ProviderDashboardPage: {
    pageTitle: "Provider Dashboard",
    manageServices: "Manage My Services",
    activeOrders: "Active Orders",
    earnings: "Earnings",
    profileSettings: "Profile Settings",
    availability: "Availability Calendar",
  },
  AdminLayout: {
    adminPanelTitle: "Ameenee Admin",
    dashboard: "Dashboard",
    providerManagement: "Providers",
    categoryManagement: "Categories",
    disputeResolution: "Disputes",
  },
  AdminDashboardPage: {
    pageTitle: "Admin Analytics Dashboard",
    description: "Overview of marketplace performance.",
  },
  AdminProvidersPage: {
    pageTitle: "Provider Management",
    approveAction: "Approve",
    rejectAction: "Reject",
    suspendAction: "Suspend",
    providerApprovedToast: "Provider {providerId} approved.",
    providerRejectedToast: "Provider {providerId} rejected.",
    providerSuspendedToast: "Provider {providerId} suspended.",
    errorUpdatingProvider: "Error updating provider status.",
  },
  AdminCategoriesPage: {
    pageTitle: "Category Management",
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
    categoryDeleteConfirmTitle: "Confirm Deletion",
    categoryDeleteConfirmText: "Are you sure you want to delete/deactivate this category?",
    categoryDeletedSuccess: "Category status updated/deleted.",
    categoryDeleteError: "Failed to update category status.",
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
    selectLanguage: "Select Language",
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
    // Dynamically import the message file for the requested locale
    messages = (await import(`./messages/${locale}.json`)).default;
    
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.warn(`i18n.ts: Messages for locale "${locale}" are empty or invalid after import. Using ultimate English fallback messages.`);
      messages = i18nUltimateFallbackMessages;
    }
  } catch (error) {
    console.error(`i18n.ts: Could not load messages for locale "${locale}". Error: ${error}. Using ultimate English fallback messages.`);
    // If even the dynamic import fails, use the hardcoded ultimate fallback
    messages = i18nUltimateFallbackMessages;
  }
  
  // If after all fallbacks, messages are still critically empty (e.g., i18nUltimateFallbackMessages was somehow corrupted)
  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
    console.error(`i18n.ts: CRITICAL - Messages for locale "${locale}" are still empty even after all fallbacks. This indicates a severe issue. Propagating notFound.`);
    notFound();
  }

  return {
    messages: messages as AbstractIntlMessages,
  };
});
