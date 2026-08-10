import { useMemo } from 'react';
import { mockListings } from '../../data/mockListings';
import { LocationPinIcon } from './icons';

// TEMP: goi y dia diem lay tu dia chi cac listing mau. Thay bang API goi y that khi REQ_05/06 xong.
const SUGGESTIONS = [...new Set(mockListings.map((l) => l.address))];

export default function LocationDropdown({ query, onPick }) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUGGESTIONS;
    return SUGGESTIONS.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-xl">
      <p className="px-3 pb-2 pt-1 text-sm font-semibold text-neutral-900">
        {query.trim() ? 'Kết quả gợi ý' : 'Điểm đến phổ biến'}
      </p>
      {results.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-neutral-500">Không tìm thấy điểm đến phù hợp.</p>
      ) : (
        <ul className="list-none">
          {results.map((place) => (
            <li key={place}>
              <button
                type="button"
                onClick={() => onPick(place)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-neutral-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <LocationPinIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-neutral-800">{place}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
