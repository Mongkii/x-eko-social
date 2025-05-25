
import type { EkoDrop } from '@/lib/types';

const SAMPLE_AUDIO_URL_1 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder audio
const SAMPLE_AUDIO_URL_2 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
const SAMPLE_AUDIO_URL_3 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3';

const now = new Date().toISOString();

export const initialEkoDrops: EkoDrop[] = [
  {
    id: 'eko1',
    audioURL: SAMPLE_AUDIO_URL_1,
    duration: 185, // Example duration in seconds
    userId: 'userAlice',
    transcript: {
      en: "Hey everyone, just sharing my thoughts on the new tech announcements! Really exciting stuff.",
      es: "¡Hola a todos, solo compartiendo mis pensamientos sobre los nuevos anuncios tecnológicos! Cosas realmente emocionantes.",
      ar: "مرحبًا بالجميع، أشارككم أفكاري حول الإعلانات التقنية الجديدة! أشياء مثيرة حقًا.",
    },
    sourceLanguage: 'en',
    hashtags: ['Tech', 'Innovation', 'Future'],
    likes: 120,
    replyCount: 15,
    createdAt: now,
    isAd: false,
  },
  {
    id: 'ekoAd1',
    audioURL: SAMPLE_AUDIO_URL_2,
    duration: 30,
    userId: 'brandX',
    transcript: {
      en: "Check out BrandX's new amazing product! Visit our website to learn more and get a special discount.",
      es: "¡Descubre el nuevo producto increíble de BrandX! Visita nuestro sitio web para obtener más información y un descuento especial.",
      ar: "اكتشف منتج BrandX الجديد المذهل! قم بزيارة موقعنا لمعرفة المزيد والحصول على خصم خاص.",
    },
    sourceLanguage: 'en',
    hashtags: ['Promotion', 'Gadget'],
    likes: 250,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isAd: true,
    advertiserName: 'BrandX Solutions',
    adClickURL: 'https://example.com/brandx',
  },
  {
    id: 'eko2',
    audioURL: SAMPLE_AUDIO_URL_3,
    duration: 240,
    userId: 'userBob',
    transcript: {
      en: "Just finished a great workout session. Feeling energized! #fitness #healthylifestyle",
      es: "Acabo de terminar una gran sesión de entrenamiento. ¡Sintiéndome con energía! #fitness #estilodevidasaludable",
      ar: "لقد أنهيت للتو جلسة تمرين رائعة. أشعر بالنشاط! #لياقة #أسلوب_حياة_صحي",
    },
    sourceLanguage: 'en',
    hashtags: ['Fitness', 'Motivation', 'Health'],
    likes: 88,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isAd: false,
  },
  {
    id: 'eko3',
    audioURL: SAMPLE_AUDIO_URL_1, // Reusing for demo
    duration: 120,
    userId: 'userCharlie',
    transcript: {
      en: "My travel vlog about Paris is now live! So many beautiful sights and sounds.",
      es: "¡Mi vlog de viaje sobre París ya está en vivo! Tantos lugares y sonidos hermosos.",
      ar: "مدونة الفيديو الخاصة بي عن باريس متاحة الآن! الكثير من المشاهد والأصوات الجميلة.",
    },
    sourceLanguage: 'en',
    hashtags: ['Travel', 'Paris', 'Adventure'],
    likes: 310,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isAd: false,
  },
];

export const allAvailableEkoDrops: EkoDrop[] = [
  ...initialEkoDrops,
  // Add more diverse EkoDrops for personalization simulation if needed
];
