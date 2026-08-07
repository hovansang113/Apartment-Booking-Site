import { useMemo, useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { StarIcon } from '../common/icons';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

function Counter({ label, sub, value, onInc, onDec, disableInc, disableDec }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {sub && <p className="text-xs text-neutral-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDec}
          disabled={disableDec}
          className="w-7 h-7 rounded-full border border-neutral-300 text-neutral-600 flex items-center justify-center hover:border-neutral-500 disabled:opacity-30 disabled:cursor-default transition-colors text-lg leading-none"
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-medium text-neutral-800">{value}</span>
        <button
          type="button"
          onClick={onInc}
          disabled={disableInc}
          className="w-7 h-7 rounded-full border border-neutral-300 text-neutral-600 flex items-center justify-center hover:border-neutral-500 disabled:opacity-30 disabled:cursor-default transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

// REQ_07 (tao booking) chua co API that — nut Dat phong chi hien thong bao tam.
export default function BookingWidget({ listing }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalGuests = adults + children;
  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = nights * listing.pricePerNight;
  const maxGuests = listing.guestCapacity;

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGuestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (nights === 0) {
      toast.error('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    toast('Tính năng đặt phòng đang được phát triển, quay lại sau nhé!');
  }

  const guestLabel = children > 0
    ? `${adults} người lớn, ${children} trẻ em`
    : `${adults} người lớn`;

  return (
    <div className="rounded-xl border border-neutral-200 p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <p>
          <span className="text-lg font-semibold">{currencyFormatter.format(listing.pricePerNight)}</span>{' '}
          <span className="text-neutral-500">/ đêm</span>
        </p>
        <span className="flex items-center gap-1 text-sm">
          <StarIcon className="h-3.5 w-3.5" />
          {listing.rating.toFixed(2)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="overflow-hidden rounded-lg border border-neutral-300">
          {/* Dates */}
          <div className="grid grid-cols-2">
            <label className="border-r border-neutral-300 px-3 py-2">
              <span className="block text-[10px] font-semibold uppercase text-neutral-700">Nhận phòng</span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <label className="px-3 py-2">
              <span className="block text-[10px] font-semibold uppercase text-neutral-700">Trả phòng</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          {/* Guest trigger */}
          <div className="border-t border-neutral-300 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setGuestOpen((o) => !o)}
              className="w-full text-left px-3 py-2"
            >
              <span className="block text-[10px] font-semibold uppercase text-neutral-700">Khách</span>
              <span className="text-sm text-neutral-800">{guestLabel}</span>
            </button>

            {/* Dropdown */}
            {guestOpen && (
              <div className="absolute left-0 right-0 top-full z-20 bg-white border border-neutral-200 rounded-b-lg shadow-lg px-4 divide-y divide-neutral-100">
                <Counter
                  label="Người lớn"
                  sub="Từ 13 tuổi trở lên"
                  value={adults}
                  onInc={() => setAdults((v) => v + 1)}
                  onDec={() => setAdults((v) => v - 1)}
                  disableInc={totalGuests >= maxGuests}
                  disableDec={adults <= 1}
                />
                <Counter
                  label="Trẻ em"
                  sub="Dưới 13 tuổi"
                  value={children}
                  onInc={() => setChildren((v) => v + 1)}
                  onDec={() => setChildren((v) => v - 1)}
                  disableInc={totalGuests >= maxGuests}
                  disableDec={children <= 0}
                />
                <div className="py-2 text-xs text-neutral-400">
                  Tối đa {maxGuests} khách
                </div>
                <div className="py-3">
                  <button
                    type="button"
                    onClick={() => setGuestOpen(false)}
                    className="text-sm font-semibold text-neutral-800 underline"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Đặt phòng
        </button>

        {nights > 0 && (
          <div className="mt-4 space-y-2 text-sm text-neutral-700">
            <div className="flex justify-between">
              <span>{currencyFormatter.format(listing.pricePerNight)} x {nights} đêm</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
              <span>Tổng cộng</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
