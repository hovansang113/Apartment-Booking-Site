import { useState } from 'react';
import { SearchIcon } from './icons';

const SEGMENTS = [
  { key: 'location', label: 'Địa điểm', placeholder: 'Tìm kiếm điểm đến' },
  { key: 'checkIn', label: 'Nhận phòng', placeholder: 'Thêm ngày' },
  { key: 'checkOut', label: 'Trả phòng', placeholder: 'Thêm ngày' },
  { key: 'guests', label: 'Khách', placeholder: 'Thêm khách' },
];

// Presentational only for now — REQ_05/06 (tim kiem/loc listing that) chua co API.
export default function SearchBar() {
  const [active, setActive] = useState(null);
  const [values, setValues] = useState({ location: '', checkIn: '', checkOut: '', guests: '' });

  return (
    <form
      role="search"
      aria-label="Tìm kiếm chỗ ở"
      className="flex items-center rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow divide-x divide-neutral-200"
      onSubmit={(e) => e.preventDefault()}
    >
      {SEGMENTS.map((seg) => (
        <label
          key={seg.key}
          className={`flex-1 min-w-[120px] cursor-pointer rounded-full px-5 py-2.5 transition-colors ${
            active === seg.key ? 'bg-neutral-100' : 'hover:bg-neutral-50'
          }`}
        >
          <span className="block text-xs font-semibold text-neutral-900">{seg.label}</span>
          <input
            type="text"
            value={values[seg.key]}
            onFocus={() => setActive(seg.key)}
            onBlur={() => setActive(null)}
            onChange={(e) => setValues((v) => ({ ...v, [seg.key]: e.target.value }))}
            placeholder={seg.placeholder}
            className="w-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 outline-none"
          />
        </label>
      ))}
      <div className="pl-2 pr-2">
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-white hover:bg-brand-700 transition-colors"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
