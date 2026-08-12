import { useState } from 'react';
import { SearchIcon } from './icons';

const SEGMENTS = [
  { key: 'location', label: 'Location',   placeholder: 'Search destination' },
  { key: 'checkIn',  label: 'Check-in',   placeholder: 'Add date' },
  { key: 'checkOut', label: 'Check-out',  placeholder: 'Add date' },
  { key: 'guests',   label: 'Guests',     placeholder: 'Add guests' },
];

const C_BRAND = '#2F4A3E';

export default function SearchBar() {
  const [active, setActive] = useState(null);
  const [values, setValues] = useState({ location: '', checkIn: '', checkOut: '', guests: '' });

  return (
    <form
      role="search"
      aria-label="Search listings"
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center bg-white"
      style={{
        border: '1.5px solid #E8E8E6',
        borderRadius: '10px 2px 10px 2px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {SEGMENTS.map((seg, i) => (
        <div key={seg.key} className="flex items-center flex-1 min-w-0">
          {i > 0 && (
            <div style={{ width: 1, height: 20, backgroundColor: '#E8E8E6', flexShrink: 0 }} />
          )}
          <label
            className="flex-1 min-w-0 cursor-pointer px-4 py-2.5 transition-colors"
            style={{ backgroundColor: active === seg.key ? '#F4F4F2' : 'transparent' }}
          >
            <span
              className="block text-[10px] font-semibold uppercase leading-tight"
              style={{ color: C_BRAND, letterSpacing: '0.08em' }}
            >
              {seg.label}
            </span>
            <input
              type="text"
              value={values[seg.key]}
              onFocus={() => setActive(seg.key)}
              onBlur={() => setActive(null)}
              onChange={(e) => setValues((v) => ({ ...v, [seg.key]: e.target.value }))}
              placeholder={seg.placeholder}
              className="w-full bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none mt-0.5"
            />
          </label>
        </div>
      ))}

      <div className="pr-2 pl-2 shrink-0">
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center w-10 h-10 text-white transition-colors"
          style={{ backgroundColor: C_BRAND, borderRadius: '8px 2px 8px 2px' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#243b31'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C_BRAND; }}
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
