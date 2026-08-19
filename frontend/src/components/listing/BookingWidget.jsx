import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { StarIcon } from '../common/icons';
import { nightlyBreakdown } from '../../utils/bookingPricing';
import { formatPrice } from '../../utils/currency';

function scrollToCalendar() {
  document.getElementById('availability-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

// REQ_07: chi con lo viec chon ngay/khach + xem truoc gia. Bam "Dat phong" se
// dieu huong sang CheckoutPage rieng (/listings/:id/checkout, full trang,
// khong con nhet form lien he vao cai card nho nay nua) - noi thu that nhap
// thong tin lien he + tao booking, roi moi sang PaymentPage (Phase 4).
export default function BookingWidget({ listing, checkIn, checkOut }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dateFnsLocale = enUS;
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalGuests = adults + children;
  const { weekdayNights, weekendNights, nights, total: subtotal } = useMemo(
    () => nightlyBreakdown(checkIn, checkOut, listing.weekdayPrice, listing.weekendPrice),
    [checkIn, checkOut, listing.weekdayPrice, listing.weekendPrice],
  );
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

  function handleReserve(e) {
    e.preventDefault();
    if (nights === 0) {
      toast.error(t('listing.booking.selectDatesError'));
      return;
    }
    const params = new URLSearchParams({ checkIn, checkOut, adults: String(adults), children: String(children) });
    navigate(`/listings/${listing.id}/checkout?${params.toString()}`);
  }

  const guestLabel = children > 0
    ? t('listing.booking.adultsChildrenLabel', { adults, children })
    : t('listing.booking.adultsLabel', { count: adults });

  return (
    <div className="rounded-xl border border-neutral-200 p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <p>
          {listing.weekdayPrice !== listing.weekendPrice && (
            <span className="text-neutral-500">{t('listing.priceFrom')} </span>
          )}
          <span className="text-lg font-semibold">{formatPrice(listing.pricePerNight)}</span>{' '}
          <span className="text-neutral-500">{t('listing.booking.night')}</span>
        </p>
        {listing.rating != null && (
          <span className="flex items-center gap-1 text-sm">
            <StarIcon className="h-3.5 w-3.5" />
            {listing.rating.toFixed(2)}
          </span>
        )}
      </div>

      <form onSubmit={handleReserve} className="mt-4">
        {/* relative (khong overflow-hidden) boc ngoai ca khoi lan dropdown, de
            dropdown "Guests" (position: absolute) khong bi khung bo goc tron
            ben trong (overflow-hidden) cat mat - loi that phat hien luc test
            (nut van hoat dong ngam vi state React van doi dung, nhung nguoi
            dung khong nhin thay dropdown do bi clip). */}
        <div className="relative" ref={dropdownRef}>
          <div className="overflow-hidden rounded-lg border border-neutral-300">
            {/* Dates - bam vao se cuon xuong AvailabilityCalendar (id="availability-calendar")
                phia duoi trang, dung 1 nguon chon ngay duy nhat thay vi input[type=date]
                cua trinh duyet (khong theo style trang, luon hien tieng Anh). */}
            <div className="grid grid-cols-2">
              <button
                type="button"
                onClick={scrollToCalendar}
                className="border-r border-neutral-300 px-3 py-2 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="block text-[10px] font-semibold uppercase text-neutral-700">{t('listing.booking.checkIn')}</span>
                <span className={`block text-sm ${checkIn ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  {checkIn ? format(parseISO(checkIn), 'd MMM yyyy', { locale: dateFnsLocale }) : t('search.addDates')}
                </span>
              </button>
              <button
                type="button"
                onClick={scrollToCalendar}
                className="px-3 py-2 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="block text-[10px] font-semibold uppercase text-neutral-700">{t('listing.booking.checkOut')}</span>
                <span className={`block text-sm ${checkOut ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  {checkOut ? format(parseISO(checkOut), 'd MMM yyyy', { locale: dateFnsLocale }) : t('search.addDates')}
                </span>
              </button>
            </div>

            {/* Guest trigger */}
            <div className="border-t border-neutral-300">
              <button
                type="button"
                onClick={() => setGuestOpen((o) => !o)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors"
              >
                <span className="block text-[10px] font-semibold uppercase text-neutral-700">{t('listing.booking.guests')}</span>
                <span className="text-sm text-neutral-800">{guestLabel}</span>
              </button>
            </div>
          </div>

          {/* Dropdown - nam ngoai khung overflow-hidden o tren, van dinh vi
              dung ngay duoi khoi Dates/Guests vi "relative" cha bao ca khoi. */}
          {guestOpen && (
            <div className="absolute left-0 right-0 top-full z-20 bg-white border border-neutral-200 rounded-lg shadow-lg px-4 divide-y divide-neutral-100">
              <Counter
                label={t('listing.booking.adults')}
                sub={t('listing.booking.adultsHint')}
                value={adults}
                onInc={() => setAdults((v) => v + 1)}
                onDec={() => setAdults((v) => v - 1)}
                disableInc={totalGuests >= maxGuests}
                disableDec={adults <= 1}
              />
              <Counter
                label={t('listing.booking.children')}
                sub={t('listing.booking.childrenHint')}
                value={children}
                onInc={() => setChildren((v) => v + 1)}
                onDec={() => setChildren((v) => v - 1)}
                disableInc={totalGuests >= maxGuests}
                disableDec={children <= 0}
              />
              <div className="py-2 text-xs text-neutral-400">
                {t('listing.booking.maxGuests', { count: maxGuests })}
              </div>
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setGuestOpen(false)}
                  className="text-sm font-semibold text-neutral-800 underline"
                >
                  {t('listing.booking.done')}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          {t('listing.booking.submit')}
        </button>

        {nights > 0 && (
          <div className="mt-4 space-y-2 text-sm text-neutral-700">
            {weekdayNights > 0 && weekendNights > 0 ? (
              <>
                <div className="flex justify-between">
                  <span>{t('listing.booking.subtotal', { price: formatPrice(listing.weekdayPrice), nights: weekdayNights })}</span>
                  <span>{formatPrice(weekdayNights * listing.weekdayPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('listing.booking.subtotal', { price: formatPrice(listing.weekendPrice), nights: weekendNights })}</span>
                  <span>{formatPrice(weekendNights * listing.weekendPrice)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>{t('listing.booking.subtotal', { price: formatPrice(weekendNights > 0 ? listing.weekendPrice : listing.weekdayPrice), nights })}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            )}
            {listing.cleaningFee > 0 && (
              <div className="flex justify-between">
                <span>{t('listing.booking.cleaningFee')}</span>
                <span>{formatPrice(listing.cleaningFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
              <span>{t('listing.booking.total')}</span>
              <span>{formatPrice(subtotal + listing.cleaningFee)}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
