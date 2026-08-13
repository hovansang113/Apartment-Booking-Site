import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './icons';

const LANGS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

// Nut chon ngon ngu dung chung (Header + AdminLayout). Doi ngay lap tuc
// (khong can reload), i18n.js tu luu lua chon vao localStorage.
export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();

  function handleChange() {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
  }

  const current = LANGS.find((l) => l.code === i18n.language) || LANGS[0];

  return (
    <button
      type="button"
      onClick={handleChange}
      title={current.label}
      aria-label="Language"
      className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors ${className}`}
    >
      <GlobeIcon className="h-4 w-4" />
      {i18n.language.toUpperCase()}
    </button>
  );
}
