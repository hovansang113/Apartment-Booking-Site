import { useTranslation } from 'react-i18next';
import { CategoryIcon } from './icons';

// Khop voi enum ListingCategory trong backend/prisma/schema.prisma
const CATEGORY_KEYS = ['all', 'apartment', 'house', 'villa', 'homestay', 'hotel_room'];

export default function CategoryTabs({ active, onChange }) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('category.ariaLabel')} className="border-b border-neutral-200 bg-white">
      <ul className="mx-auto flex max-w-7xl list-none gap-6 overflow-x-auto px-4 py-3 scrollbar-hide sm:px-6 lg:px-8">
        {CATEGORY_KEYS.map((key) => {
          const isActive = active === key;
          return (
            <li key={key} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-pressed={isActive}
                className={`flex flex-col items-center gap-1.5 border-b-2 px-1 pb-2 pt-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
                }`}
              >
                <CategoryIcon name={key} className="h-6 w-6" />
                {t(`category.${key}`)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
