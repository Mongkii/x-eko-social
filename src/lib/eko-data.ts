
import type { EkoDrop } from '@/lib/types';

const SAMPLE_AUDIO_URL_1 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder audio
const SAMPLE_AUDIO_URL_2 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
const SAMPLE_AUDIO_URL_3 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3';

const now = new Date().toISOString();

export const initialEkoDrops: EkoDrop[] = [
  {
    id: 'eko1',
    audioURL: SAMPLE_AUDIO_URL_1,
    duration: 185, 
    userId: 'userAlice',
    transcript: {
      en: "Hey everyone, just sharing my thoughts on the new tech announcements! Really exciting stuff.",
      es: "¡Hola a todos, solo compartiendo mis pensamientos sobre los nuevos anuncios tecnológicos! Cosas realmente emocionantes.",
      ar: "مرحبًا بالجميع، أشارككم أفكاري حول الإعلانات التقنية الجديدة! أشياء مثيرة حقًا.",
      ur: "سب کو سلام، نئی ٹیک اعلانات پر اپنے خیالات کا اظہار کر رہا ہوں! واقعی دلچسپ چیزیں۔",
      fr: "Salut tout le monde, je partage juste mes réflexions sur les nouvelles annonces technologiques ! Des trucs vraiment excitants.",
      de: "Hallo zusammen, ich teile nur meine Gedanken zu den neuen Tech-Ankündigungen! Wirklich aufregende Sachen.",
      hi: "सभी को नमस्कार, नई तकनीकी घोषणाओं पर अपने विचार साझा कर रहा हूँ! वास्तव में रोमांचक चीजें।",
      zh: "大家好，我只是分享一下我对新技术发布的看法！非常令人兴奋。",
      tl: "Hoy sa lahat, ibinabahagi ko lang ang aking mga saloobin sa mga bagong anunsyo sa teknolohiya! Talagang kapana-panabik na mga bagay."
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
      ur: "BrandX کی نئی حیرت انگیز پروڈکٹ دیکھیں! مزید جاننے اور خصوصی رعایت حاصل کرنے کے لیے ہماری ویب سائٹ ملاحظہ کریں۔",
      fr: "Découvrez le nouveau produit incroyable de BrandX ! Visitez notre site Web pour en savoir plus et obtenir une réduction spéciale.",
      de: "Schauen Sie sich das neue erstaunliche Produkt von BrandX an! Besuchen Sie unsere Website, um mehr zu erfahren und einen Sonderrabatt zu erhalten.",
      hi: "BrandX का नया अद्भुत उत्पाद देखें! अधिक जानने और विशेष छूट पाने के लिए हमारी वेबसाइट पर जाएँ।",
      zh: "快来看看 BrandX 的新产品吧！访问我们的网站了解更多信息并获得特别折扣。",
      tl: "Tingnan ang bagong kamangha-manghang produkto ng BrandX! Bisitahin ang aming website para matuto pa at makakuha ng espesyal na diskwento."
    },
    sourceLanguage: 'en',
    hashtags: ['Promotion', 'Gadget'],
    likes: 250,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
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
      ur: "ابھی ایک زبردست ورزش سیشن مکمل کیا۔ توانائی محسوس ہو رہی ہے! #فٹنس #صحت_مند_طرز_زندگی",
      fr: "Je viens de terminer une excellente séance d'entraînement. Je me sens plein d'énergie ! #fitness #healthylifestyle",
      de: "Habe gerade ein tolles Training beendet. Fühle mich energiegeladen! #fitness #healthylifestyle",
      hi: "अभी-अभी एक बेहतरीन वर्कआउट सेशन पूरा किया। ऊर्जावान महसूस कर रहा हूँ! #फिटनेस #स्वस्थ_जीवनशैली",
      zh: "刚完成一次很棒的锻炼。感觉精力充沛！#健身 #健康生活方式",
      tl: "Katatapos lang ng isang mahusay na sesyon ng ehersisyo. Masigla ang pakiramdam! #fitness #healthylifestyle"
    },
    sourceLanguage: 'en',
    hashtags: ['Fitness', 'Motivation', 'Health'],
    likes: 88,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    isAd: false,
  },
  {
    id: 'eko3',
    audioURL: SAMPLE_AUDIO_URL_1, 
    duration: 120,
    userId: 'userCharlie',
    transcript: {
      en: "My travel vlog about Paris is now live! So many beautiful sights and sounds.",
      es: "¡Mi vlog de viaje sobre París ya está en vivo! Tantos lugares y sonidos hermosos.",
      ar: "مدونة الفيديو الخاصة بي عن باريس متاحة الآن! الكثير من المشاهد والأصوات الجميلة.",
      ur: "پیرس کے بارے میں میرا ٹریول ویلاگ اب لائیو ہے! بہت سے خوبصورت مناظر اور آوازیں۔",
      fr: "Mon vlog de voyage sur Paris est maintenant en ligne ! Tant de belles vues et de sons.",
      de: "Mein Reise-Vlog über Paris ist jetzt live! So viele schöne Sehenswürdigkeiten und Geräusche.",
      hi: "पेरिस के बारे में मेरा यात्रा व्लॉग अब लाइव है! बहुत सारे सुंदर दृश्य और ध्वनियाँ।",
      zh: "我的巴黎旅行视频博客上线了！有很多美丽的景色和声音。",
      tl: "Live na ang travel vlog ko tungkol sa Paris! Napakaraming magagandang tanawin at tunog."
    },
    sourceLanguage: 'en',
    hashtags: ['Travel', 'Paris', 'Adventure'],
    likes: 310,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isAd: false,
  },
];

// This can be expanded later if needed, for now it mirrors initialEkoDrops
export const allAvailableEkoDrops: EkoDrop[] = [...initialEkoDrops];
