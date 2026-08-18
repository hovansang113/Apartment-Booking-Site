import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

// Site chi phuc vu UK (yeu cau Jason 18/8) - bo tieng Viet, chi con tieng Anh.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React da tu chong XSS san
});

export default i18n;
