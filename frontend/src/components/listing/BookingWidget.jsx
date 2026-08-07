import { useMemo, useState } from 'react';
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

// REQ_07 (tao booking) chua co API that — nut Dat phong chi hien thong bao tam.
export default function BookingWidget({ listing }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = nights * listing.pricePerNight;

  function handleSubmit(e) {
    e.preventDefault();
    if (nights === 0) {
      toast.error('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    toast('Tính năng đặt phòng đang được phát triển, quay lại sau nhé!');
  }

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
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-neutral-300">
          <label className="border-r border-neutral-300 px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase text-neutral-700">
              Nhận phòng
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase text-neutral-700">
              Trả phòng
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="col-span-2 border-t border-neutral-300 px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase text-neutral-700">Khách</span>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-sm outline-none"
            >
              {Array.from({ length: listing.guestCapacity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} khách
                </option>
              ))}
            </select>
          </label>
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
              <span>
                {currencyFormatter.format(listing.pricePerNight)} x {nights} đêm
              </span>
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
