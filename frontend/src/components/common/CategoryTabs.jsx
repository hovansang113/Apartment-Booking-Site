import { CategoryIcon } from './icons';

// Khop voi enum ListingCategory trong backend/prisma/schema.prisma
export const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'apartment', label: 'Căn hộ' },
  { key: 'house', label: 'Nhà nguyên căn' },
  { key: 'villa', label: 'Villa' },
  { key: 'homestay', label: 'Homestay' },
  { key: 'hotel_room', label: 'Phòng khách sạn' },
];

export default function CategoryTabs({ active, onChange }) {
  return (
    <nav aria-label="Danh mục chỗ ở" className="border-b border-neutral-200 bg-white">
      <ul className="mx-auto flex max-w-7xl list-none gap-6 overflow-x-auto px-4 py-3 scrollbar-hide sm:px-6 lg:px-8">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.key;
          return (
            <li key={cat.key} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(cat.key)}
                aria-pressed={isActive}
                className={`flex flex-col items-center gap-1.5 border-b-2 px-1 pb-2 pt-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
                }`}
              >
                <CategoryIcon name={cat.key} className="h-6 w-6" />
                {cat.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
