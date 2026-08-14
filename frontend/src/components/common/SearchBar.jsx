import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon } from './icons';
import api from '../../services/api';

const C_BRAND = '#2F4A3E';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(null);
  const [values, setValues] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef(null);
  const debouncedLocation = useDebounce(values.location, 250);

  // Sync from URL on mount
  useEffect(() => {
    setValues({
      location: searchParams.get('location') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      guests: searchParams.get('guests') || '',
    });
  }, []);

  // Fetch location suggestions
  useEffect(() => {
    if (!showSuggestions) return;
    api.get('/listings/locations', { params: { q: debouncedLocation || undefined } })
      .then((res) => setSuggestions(res.data.data || []))
      .catch(() => setSuggestions([]));
  }, [debouncedLocation, showSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (values.location) params.set('location', values.location);
    if (values.checkIn) params.set('checkIn', values.checkIn);
    if (values.checkOut) params.set('checkOut', values.checkOut);
    if (values.guests) params.set('guests', values.guests);
    navigate(`/?${params.toString()}`);
  }

  function selectSuggestion(address) {
    setValues((v) => ({ ...v, location: address }));
    setShowSuggestions(false);
  }

  const OTHER_SEGMENTS = [
    { key: 'checkIn',  label: 'Check-in',  placeholder: 'Add date',   type: 'date' },
    { key: 'checkOut', label: 'Check-out', placeholder: 'Add date',   type: 'date' },
    { key: 'guests',   label: 'Guests',    placeholder: 'Add guests', type: 'number' },
  ];

  return (
    <form
      role="search"
      aria-label="Search listings"
      onSubmit={handleSubmit}
      className="flex items-center bg-white"
      style={{
        border: '1.5px solid #E8E8E6',
        borderRadius: '10px 2px 10px 2px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Location with autocomplete */}
      <div className="flex items-center flex-1 min-w-0 relative" ref={locationRef}>
        <label
          className="flex-1 min-w-0 cursor-pointer px-4 py-2.5 transition-colors"
          style={{ backgroundColor: active === 'location' ? '#F4F4F2' : 'transparent' }}
        >
          <span
            className="block text-[10px] font-semibold uppercase leading-tight"
            style={{ color: C_BRAND, letterSpacing: '0.08em' }}
          >
            Location
          </span>
          <input
            type="text"
            value={values.location}
            onFocus={() => { setActive('location'); setShowSuggestions(true); }}
            onBlur={() => setActive(null)}
            onChange={(e) => {
              setValues((v) => ({ ...v, location: e.target.value }));
              setShowSuggestions(true);
            }}
            placeholder="Search destination"
            autoComplete="off"
            className="w-full bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none mt-0.5"
          />
        </label>

        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-neutral-100 z-50 overflow-hidden"
            onMouseDown={(e) => e.preventDefault()}
          >
            {suggestions.map((addr) => (
              <li key={addr}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(addr)}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <span style={{ color: C_BRAND }}>📍</span>
                  {addr}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Other fields */}
      {OTHER_SEGMENTS.map((seg) => (
        <div key={seg.key} className="flex items-center flex-1 min-w-0">
          <div style={{ width: 1, height: 20, backgroundColor: '#E8E8E6', flexShrink: 0 }} />
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
              type={seg.type}
              value={values[seg.key]}
              min={seg.key === 'guests' ? 1 : undefined}
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
