import { CategoryIcon } from './icons';

export const CATEGORIES = [
  { key: 'all',        label: 'All' },
  { key: 'apartment',  label: 'Apartment' },
  { key: 'house',      label: 'Entire house' },
  { key: 'villa',      label: 'Villa' },
  { key: 'homestay',   label: 'Homestay' },
  { key: 'hotel_room', label: 'Hotel room' },
];

export default function CategoryTabs({ active, onChange }) {
  return (
    <nav aria-label="Listing categories" className="border-b border-neutral-200 bg-white">
      <ul className="mx-auto flex max-w-7xl list-none gap-8 overflow-x-auto px-4 py-2 scrollbar-hide sm:px-6 lg:px-8 justify-start sm:justify-center">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.key;
          return (
            <li key={cat.key} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(cat.key)}
                aria-pressed={isActive}
                className="flex flex-col items-center gap-1.5 border-b-2 px-1 pb-2 pt-1 text-xs font-medium transition-colors"
                style={{
                  borderBottomColor: isActive ? '#C17A54' : 'transparent',
                  color: isActive ? '#2F4A3E' : '#A89E97',
                }}
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
