
import type { FeedItemData, Transcript } from './types';

// Sample EkoDrops - Voice Posts
export const initialFeedItems: FeedItemData[] = [
  {
    id: 'eko1',
    userId: 'user_alpha',
    type: 'content', // EkoDrop
    title: 'My First EkoDrop!',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/ambient_room_tone.ogg', // Placeholder audio
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', // Placeholder for audio visualization if needed
    imageUrl: 'https://placehold.co/600x600.png?text=Eko1',
    dataAiHint: 'podcast audio',
    duration: 28, // seconds
    transcript: {
      en: "Hello Eko world! This is my first voice post. Excited to be here and share my thoughts.",
      ar: "مرحباً عالم إيكو! هذا أول منشور صوتي لي. متحمس لوجودي هنا ومشاركة أفكاري.",
      es: "¡Hola mundo Eko! Esta es mi primera publicación de voz. Emocionado de estar aquí y compartir mis pensamientos.",
      ur: "ہیلو ایکو ورلڈ! یہ میری پہلی وائس پوسٹ ہے۔ یہاں آ کر اور اپنے خیالات کا اشتراک کرنے پر بہت پرجوش ہوں۔",
      fr: "Bonjour le monde Eko ! Ceci est mon premier message vocal. Ravi d'être ici et de partager mes réflexions.",
      de: "Hallo Eko-Welt! Dies ist mein erster Sprachbeitrag. Ich freue mich, hier zu sein und meine Gedanken zu teilen.",
      hi: "नमस्ते इको वर्ल्ड! यह मेरी पहली वॉयस पोस्ट है। यहां आकर और अपने विचार साझा करके उत्साहित हूं।",
      zh: "你好Eko世界！这是我的第一个语音帖子。很高兴来到这里分享我的想法。",
      tl: "Kumusta Eko mundo! Ito ang aking unang voice post. Nasasabik akong maparito at ibahagi ang aking mga saloobin."
    },
    hashtags: ['introduction', 'newbeginnings', 'voicefirst'],
    sourceLanguage: 'en',
    likesCount: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isAd: false,
  },
  {
    id: 'eko2',
    userId: 'user_beta',
    type: 'content',
    title: 'Thoughts on Future Tech',
    audioUrl: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg', // Placeholder audio
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    imageUrl: 'https://placehold.co/600x600.png?text=Eko2',
    dataAiHint: 'technology future',
    duration: 45, // seconds
    transcript: {
      en: "Thinking about where technology is headed... AI, metaverse, it's all fascinating.",
      ar: "أفكر في الاتجاه الذي تتجه إليه التكنولوجيا... الذكاء الاصطناعي، الميتافيرس، كل هذا رائع.",
      // ... add other languages
    },
    hashtags: ['tech', 'future', 'AI', 'metaverse'],
    sourceLanguage: 'en',
    likesCount: 78,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isAd: false,
  },
  {
    id: 'ad1',
    userId: 'advertiser_eko',
    type: 'ad', // Ad
    title: 'Eko+ Premium Subscription!',
    audioUrl: 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg', // Placeholder audio
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', // Ad video
    imageUrl: 'https://placehold.co/600x600.png?text=Eko%2BAd',
    dataAiHint: 'subscription offer',
    duration: 15, // seconds
    transcript: {
      en: "Upgrade to Eko+ for an ad-free experience, exclusive content, and more!",
      ar: "قم بالترقية إلى إيكو+ لتجربة خالية من الإعلانات ومحتوى حصري والمزيد!",
      // ... add other languages
    },
    hashtags: ['eko_plus', 'premium', 'subscribe'],
    sourceLanguage: 'en',
    likesCount: 0, // Ads usually don't have likes in the same way
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isAd: true,
    advertiser: 'Eko Inc.',
    adTargetUrl: 'https://eko.example.com/plus',
    rating: 0, // Initial rating for ads
  },
  {
    id: 'eko3',
    userId: 'user_gamma',
    type: 'content',
    title: 'Quick Recipe Idea',
    audioUrl: 'https://actions.google.com/sounds/v1/alarms/dinner_bell.ogg', // Placeholder audio
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    imageUrl: 'https://placehold.co/600x600.png?text=Eko3',
    dataAiHint: 'food recipe',
    duration: 33, // seconds
    transcript: {
      en: "Just shared a quick and easy recipe for a healthy smoothie. Check it out!",
      ar: "لقد شاركت للتو وصفة سريعة وسهلة لسموذي صحي. تفقدها!",
      // ... add other languages
    },
    hashtags: ['recipe', 'smoothie', 'healthyfood'],
    sourceLanguage: 'en',
    likesCount: 102,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isAd: false,
  },
];

// Sample Ads - These could also be EkoDrops marked as ads
export const allAvailableAds: FeedItemData[] = [
  {
    id: 'ad2_brandx',
    userId: 'advertiser_brandx',
    type: 'ad',
    title: 'BrandX Headphones - Hear the Difference!',
    audioUrl: 'https://actions.google.com/sounds/v1/industry/concert_crowd_applause.ogg', // Placeholder audio
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', // Ad video
    imageUrl: 'https://placehold.co/600x600.png?text=BrandX+Ad',
    dataAiHint: 'headphones audio product',
    duration: 20, // seconds
    transcript: {
      en: "Experience immersive sound with BrandX headphones. Limited time offer!",
      ar: "جرب الصوت الغامر مع سماعات BrandX. عرض لوقت محدود!",
      // ... add other languages
    },
    hashtags: ['headphones', 'audio', 'deal'],
    sourceLanguage: 'en',
    likesCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isAd: true,
    advertiser: 'BrandX Audio',
    adTargetUrl: 'https://brandx.example.com',
    rating: 0,
  },
];
