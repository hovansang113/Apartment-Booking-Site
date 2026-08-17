import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';
import en from './locales/en.json';

const STORAGE_KEY = 'stayhub_lang';
const savedLang = localStorage.getItem(STORAGE_KEY);

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: savedLang || 'en', // mac dinh tieng Anh theo yeu cau (17/8)
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React da tu chong XSS san
});

// Luu lai lua chon moi lan doi ngon ngu, de nho lai lan sau vao
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
