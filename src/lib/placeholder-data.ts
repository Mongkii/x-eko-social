
import type { MarketplaceCategory, MarketplaceService, LegalProvider, ServiceReview, User, MarketplaceOrder } from './types';

export const sampleCategoriesData: MarketplaceCategory[] = [
  { id: 'estate-planning', name_en: 'Estate Planning', name_ar: 'تخطيط التركات', description_en: 'Secure your legacy with professional estate planning services, including will drafting and trust formation.', description_ar: 'أمّن إرثك بخدمات تخطيط التركات المتخصصة، بما في ذلك صياغة الوصايا وتأسيس الصناديق الاستئمانية.', is_active: true, imageUrl: 'https://placehold.co/600x400.png?text=Estate', dataAiHint: 'legal documents inheritance plan' },
  { id: 'business-law', name_en: 'Business Law', name_ar: 'قانون الأعمال', description_en: 'Navigate complex business legalities, from startup formation to contract negotiation and compliance.', description_ar: 'تنقل في تعقيدات قانون الأعمال، من تأسيس الشركات الناشئة إلى التفاوض على العقود والامتثال.', is_active: true, imageUrl: 'https://placehold.co/600x400.png?text=Business', dataAiHint: 'corporate law contract agreement' },
  { id: 'inheritance-disputes', name_en: 'Inheritance Disputes', name_ar: 'نزاعات الميراث', description_en: 'Resolve inheritance conflicts and succession issues with experienced legal mediation and representation.', description_ar: 'حل نزاعات الميراث وقضايا الخلافة بوساطة وتمثيل قانوني ذي خبرة.', is_active: true, imageUrl: 'https://placehold.co/600x400.png?text=Disputes', dataAiHint: 'family conflict gavel court' },
  { id: 'intellectual-property', name_en: 'Intellectual Property', name_ar: 'الملكية الفكرية', description_en: 'Protect your creations, trademarks, patents, and copyrights with expert IP legal services.', description_ar: 'احمِ إبداعاتك وعلاماتك التجارية وبراءات اختراعك وحقوق النشر الخاصة بك بخدمات قانونية متخصصة في الملكية الفكرية.', is_active: true, imageUrl: 'https://placehold.co/600x400.png?text=IP', dataAiHint: 'patent trademark copyright logo' },
  { id: 'real-estate-law', name_en: 'Real Estate Law', name_ar: 'قانون العقارات', description_en: 'Expert guidance for all your property transactions, leasing, and real estate disputes.', description_ar: 'إرشادات متخصصة لجميع معاملاتك العقارية والتأجير ونزاعات العقارات.', is_active: true, imageUrl: 'https://placehold.co/600x400.png?text=Real+Estate', dataAiHint: 'house contract keys property' },
];

export const sampleProvidersData: LegalProvider[] = [
  {
    id: 'provider-001',
    user_id: 'auth-uid-provider1',
    name: 'Global Legal Experts',
    bio_en: 'A consortium of seasoned legal professionals specializing in international law, estate planning, and corporate advisory. We offer services in English and Arabic.',
    bio_ar: 'مجموعة من الخبراء القانونيين المتمرسين والمتخصصين في القانون الدولي وتخطيط التركات والاستشارات المؤسسية. نقدم خدماتنا باللغتين الإنجليزية والعربية.',
    avatar_url: 'https://placehold.co/128x128.png?text=GLE', dataAiHint: 'office building modern',
    status: 'approved',
    country_code: 'AE', city: 'Dubai',
    languages_spoken: ['en', 'ar'],
    qualifications: ['LL.M. International Business Law', 'Certified Mediator', 'Member of IBA'],
    service_category_ids: ['estate-planning', 'business-law', 'intellectual-property'],
    overall_rating: 4.8, total_reviews: 210, member_since: new Date(2018, 3, 12).toISOString(),
  },
  {
    id: 'provider-002',
    user_id: 'auth-uid-provider2',
    name: 'Fahad Al-Mutairi Law Firm',
    bio_en: 'Dedicated legal practice focusing on Sharia-compliant estate planning, inheritance law, and family business succession in the GCC region.',
    bio_ar: 'مكتب محاماة متخصص يركز على تخطيط التركات المتوافق مع الشريعة الإسلامية وقانون الميراث وخلافة الشركات العائلية في منطقة دول مجلس التعاون الخليجي.',
    avatar_url: 'https://placehold.co/128x128.png?text=FAM', dataAiHint: 'lawyer portrait arabic',
    status: 'approved',
    country_code: 'SA', city: 'Riyadh',
    languages_spoken: ['ar', 'en'],
    qualifications: ['PhD in Islamic Jurisprudence', 'Licensed Advocate KSA'],
    service_category_ids: ['estate-planning', 'inheritance-disputes'],
    overall_rating: 4.9, total_reviews: 155, member_since: new Date(2020, 8, 1).toISOString(),
  },
];

export const sampleServicesData: MarketplaceService[] = [
  {
    id: 'service-ep001', provider_id: 'provider-001', category_id: 'estate-planning',
    title_en: 'International Will Drafting & Execution', title_ar: 'صياغة وتنفيذ الوصايا الدولية',
    description_en: 'Comprehensive will drafting service for assets across multiple jurisdictions, ensuring international validity. Includes consultation, drafting, and guidance on execution procedures.', 
    description_ar: 'خدمة صياغة وصايا شاملة للأصول في ولايات قضائية متعددة، مما يضمن صلاحيتها الدولية. تشمل الاستشارة والصياغة والإرشاد بشأن إجراءات التنفيذ.',
    price: 1200, currency: 'USD', turnaround_time_en: '10-15 business days', turnaround_time_ar: '10-15 يوم عمل',
    avg_rating: 4.9, review_count: 65, 
    provider_name: 'Global Legal Experts', provider_avatar_url: 'https://placehold.co/128x128.png?text=GLE',
    main_image_url: 'https://placehold.co/600x400.png?text=Intl+Will', dataAiHint: 'globe pen legal document'
  },
  {
    id: 'service-bl001', provider_id: 'provider-001', category_id: 'business-law',
    title_en: 'Startup Legal Package (Incorporation & Basic Contracts)', title_ar: 'باقة قانونية للشركات الناشئة (تأسيس وعقود أساسية)',
    description_en: 'All-in-one package for startups: company incorporation, shareholder agreement, and templates for common business contracts (NDA, Service Agreement).',
    description_ar: 'باقة شاملة للشركات الناشئة: تأسيس الشركة، اتفاقية المساهمين، ونماذج للعقود التجارية الشائعة (اتفاقية عدم الإفصاح، اتفاقية الخدمة).',
    price: 2500, currency: 'USD', turnaround_time_en: '15-20 business days', turnaround_time_ar: '15-20 يوم عمل',
    avg_rating: 4.7, review_count: 90, 
    provider_name: 'Global Legal Experts', provider_avatar_url: 'https://placehold.co/128x128.png?text=GLE',
    main_image_url: 'https://placehold.co/600x400.png?text=Startup+Law', dataAiHint: 'lightbulb gears contract'
  },
  {
    id: 'service-id001', provider_id: 'provider-002', category_id: 'inheritance-disputes',
    title_en: 'Inheritance Dispute Initial Consultation & Case Review', title_ar: 'استشارة أولية ومراجعة قضية في نزاعات الميراث',
    description_en: 'Expert review of your inheritance dispute case, legal position assessment, and strategic advice on next steps (mediation or litigation).',
    description_ar: 'مراجعة متخصصة لقضية نزاع الميراث الخاصة بك، وتقييم الوضع القانوني، وتقديم المشورة الاستراتيجية بشأن الخطوات التالية (وساطة أو تقاضي).',
    price: 300, currency: 'SAR', turnaround_time_en: '2-3 business days for report', turnaround_time_ar: '2-3 أيام عمل للتقرير',
    avg_rating: 5.0, review_count: 40,
    provider_name: 'Fahad Al-Mutairi Law Firm', provider_avatar_url: 'https://placehold.co/128x128.png?text=FAM',
    main_image_url: 'https://placehold.co/600x400.png?text=Inheritance+Consult', dataAiHint: 'family tree gavel document'
  },
  {
    id: 'service-ep002', provider_id: 'provider-002', category_id: 'estate-planning',
    title_en: 'Sharia-Compliant Will Drafting (KSA)', title_ar: 'صياغة وصية متوافقة مع الشريعة (السعودية)',
    description_en: 'Drafting of a legally sound will fully compliant with Islamic Sharia principles and Saudi Arabian law.',
    description_ar: 'صياغة وصية سليمة قانونياً ومتوافقة تماماً مع مبادئ الشريعة الإسلامية والقانون السعودي.',
    price: 1800, currency: 'SAR', turnaround_time_en: '7-10 business days', turnaround_time_ar: '7-10 أيام عمل',
    avg_rating: 4.9, review_count: 55,
    provider_name: 'Fahad Al-Mutairi Law Firm', provider_avatar_url: 'https://placehold.co/128x128.png?text=FAM',
    main_image_url: 'https://placehold.co/600x400.png?text=Sharia+Will', dataAiHint: 'islamic calligraphy legal document'
  }
];

export const sampleReviewsData: ServiceReview[] = [
  { id: 'rev1', order_id: 'ord1', service_id: 'service-ep001', provider_id: 'provider-001', user_id: 'usr1', user_name: 'Aisha M.', rating: 5, comment: 'Very professional and thorough. Made a complex process very clear.', created_at: new Date(2024, 0, 15).toISOString() },
  { id: 'rev2', order_id: 'ord2', service_id: 'service-bl001', provider_id: 'provider-001', user_id: 'usr2', user_name: 'Khaled A.', rating: 4, comment: 'Good service, helped us get our startup legalities sorted quickly.', created_at: new Date(2024, 1, 2).toISOString() },
  { id: 'rev3', order_id: 'ord3', service_id: 'service-id001', provider_id: 'provider-002', user_id: 'usr3', user_name: 'Fatima H.', rating: 5, comment: 'Excellent consultation, very insightful and empathetic.', created_at: new Date(2024, 1, 20).toISOString() },
];

export const sampleUserData: User = {
  id: 'user-ameenee-client-1',
  name: 'Abdullah Client',
  email: 'client@ameenee.com',
  avatarUrl: 'https://placehold.co/80x80.png?text=AC',
  isLoggedIn: true,
  isAdmin: false,
  isProvider: false,
};

export const sampleAdminUserData: User = {
  id: 'user-ameenee-admin-1',
  name: 'Ameenee Admin',
  email: 'admin@ameenee.com',
  avatarUrl: 'https://placehold.co/80x80.png?text=AD',
  isLoggedIn: true,
  isAdmin: true,
  isProvider: false,
};

export const sampleProviderUserData: User = {
  id: 'auth-uid-provider1', // Should match one of the provider user_ids
  name: 'Global Legal Experts (User)',
  email: 'provider@gle.com',
  avatarUrl: 'https://placehold.co/128x128.png?text=GLE',
  isLoggedIn: true,
  isAdmin: false,
  isProvider: true,
  providerId: 'provider-001'
};

export const sampleOrdersData: MarketplaceOrder[] = [
  {
    id: 'order-ameenee-001',
    user_id: sampleUserData.id,
    service_id: 'service-ep001',
    provider_id: 'provider-001',
    service_title_en: 'International Will Drafting & Execution',
    service_title_ar: 'صياغة وتنفيذ الوصايا الدولية',
    status: 'completed',
    created_at: new Date(2024, 0, 10).toISOString(),
    updated_at: new Date(2024, 0, 15).toISOString(),
    price_paid: 1200,
    currency_paid: 'USD',
    payment_id: 'ch_randomstripeid1'
  },
  {
    id: 'order-ameenee-002',
    user_id: sampleUserData.id,
    service_id: 'service-id001',
    provider_id: 'provider-002',
    service_title_en: 'Inheritance Dispute Initial Consultation & Case Review',
    service_title_ar: 'استشارة أولية ومراجعة قضية في نزاعات الميراث',
    status: 'in_progress',
    created_at: new Date(2024, 2, 1).toISOString(),
    updated_at: new Date(2024, 2, 5).toISOString(),
    price_paid: 300,
    currency_paid: 'SAR',
    payment_id: 'ch_randomstripeid2'
  },
];
