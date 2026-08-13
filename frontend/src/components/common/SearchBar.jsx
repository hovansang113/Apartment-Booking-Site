import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchIcon, CloseIcon } from './icons';
import LocationDropdown from './LocationDropdown';
import DateRangePicker from './DateRangePicker';
import GuestsDropdown from './GuestsDropdown';
import { formatDateRange } from '../../utils/formatDateRange';

// Dia diem/khach loc them o client (utils/filterListings.js) tren ket qua me tu GET /api/listings.
export default function SearchBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(null);
  const [location, setLocation] = useState(() => searchParams.get('location') || '');
  const [dateRange, setDateRange] = useState({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(() => Number(searchParams.get('guests')) || null);
  const containerRef = useRef(null);

  const hasFilter = Boolean(location.trim() || dateRange.checkIn || dateRange.checkOut || guests);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActive(null);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setActive(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const dateLabel = formatDateRange(dateRange, i18n.language);

  function handleSubmit(e) {
    e.preventDefault();
    setActive(null);
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (guests) params.set('guests', String(guests));
    navigate({ pathname: '/', search: params.toString() });
  }

  function handleClearAll() {
    setLocation('');
    setDateRange({ checkIn: null, checkOut: null });
    setGuests(null);
    setActive(null);
    navigate({ pathname: '/', search: '' });
  }

  const TRIGGER_SEGMENTS = [
    { key: 'dates', label: t('search.dates'), value: dateLabel, placeholder: t('search.addDates') },
    { key: 'guests', label: t('search.guests'), value: guests ? t('search.guestsCount', { count: guests }) : null, placeholder: t('search.addGuests') },
  ];

  return (
    <div ref={containerRef} className="relative">
      <form
        role="search"
        aria-label={t('search.ariaLabel')}
        className="flex items-center rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow divide-x divide-neutral-200"
        onSubmit={handleSubmit}
      >
        <label
          className={`flex-1 min-w-[120px] cursor-pointer rounded-full px-5 py-2.5 transition-colors relative ${
            active === 'location' ? 'bg-neutral-100' : 'hover:bg-neutral-50'
          }`}
        >
          <span className="block text-xs font-semibold text-neutral-900">{t('search.location')}</span>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={location}
              onFocus={() => setActive('location')}
              onChange={(e) => {
                setLocation(e.target.value);
                setActive('location');
              }}
              placeholder={t('search.locationPlaceholder')}
              className="w-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 outline-none pr-4"
            />
            {location && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation('');
                }}
                className="text-neutral-400 hover:text-neutral-700 p-0.5"
                title={t('search.clearLocation')}
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </label>

        {TRIGGER_SEGMENTS.map((seg) => (
          <button
            type="button"
            key={seg.key}
            onClick={() => setActive((cur) => (cur === seg.key ? null : seg.key))}
            className={`flex-1 min-w-[120px] rounded-full px-5 py-2.5 text-left transition-colors ${
              active === seg.key ? 'bg-neutral-100' : 'hover:bg-neutral-50'
            }`}
          >
            <span className="block text-xs font-semibold text-neutral-900">{seg.label}</span>
            <span className={`block truncate text-sm ${seg.value ? 'text-neutral-900' : 'text-neutral-400'}`}>
              {seg.value || seg.placeholder}
            </span>
          </button>
        ))}
        <div className="pl-2 pr-2 flex items-center gap-1.5">
          {hasFilter && (
            <button
              type="button"
              onClick={handleClearAll}
              title={t('search.clearAll')}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('search.clearFilters')}</span>
            </button>
          )}
          <button
            type="submit"
            aria-label={t('search.submit')}
            className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-white hover:bg-brand-700 transition-colors"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
      </form>

      {active === 'location' && (
        <div className="absolute left-0 top-full z-40 mt-3 w-full max-w-sm">
          <LocationDropdown
            query={location}
            onPick={(place) => {
              setLocation(place);
              setActive(null);
            }}
          />
        </div>
      )}

      {active === 'dates' && (
        <div className="absolute left-1/2 top-full z-40 mt-3 w-[640px] max-w-[95vw] -translate-x-1/2">
          <DateRangePicker value={dateRange} onChange={setDateRange} onClose={() => setActive(null)} />
        </div>
      )}

      {active === 'guests' && (
        <div className="absolute right-0 top-full z-40 mt-3">
          <GuestsDropdown value={guests} onChange={setGuests} />
        </div>
      )}
    </div>
  );
}
