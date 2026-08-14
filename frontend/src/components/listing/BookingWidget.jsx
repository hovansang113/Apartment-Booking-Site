import { useMemo, useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { StarIcon } from '../common/icons';
import { createBooking } from '../../services/bookingService';

const DATE_FNS_LOCALES = { vi, en: enUS };

function scrollToCalendar() {
  document.getElementById('availability-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

// Cuoi tuan = dem Thu 6 + Thu 7 (khop dung logic backend, xem
// backend/src/utils/pricing.util.js). checkIn/checkOut la chuoi 'YYYY-MM-DD'
// nen new Date(ymd) da la UTC midnight theo spec ISO date-only - phai doc lai
// bang getUTCDay()/setUTCDate() de khong bi lech ngay theo timezone trinh
// duyet (cung class bug da gap voi node-ical o backend).
function isWeekendDate(dateObj) {
  const dow = dateObj.getUTCDay();
  return dow === 5 || dow === 6;
}

// Tinh tong tien + so dem thuong/cuoi tuan cho khoang [checkIn, checkOut).
function nightlyBreakdown(checkIn, checkOut, weekdayPrice, weekendPrice) {
  if (!checkIn || !checkOut) return { weekdayNights: 0, weekendNights: 0, total: 0 };
  let weekdayNights = 0;
  let weekendNights = 0;
  const cur = new Date(checkIn);
  const end = new Date(checkOut);
  while (cur < end) {
    if (isWeekendDate(cur)) weekendNights += 1;
    else weekdayNights += 1;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  const nights = weekdayNights + weekendNights;
  const total = nights > 0 ? weekdayNights * weekdayPrice + weekendNights * weekendPrice : 0;
  return { weekdayNights, weekendNights, nights, total };
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

// REQ_07: dat phong khong can dang nhap. 3 buoc trong 1 widget - 'review'
// (xem lai ngay/khach/gia) -> 'contact' (nhap thong tin lien he) -> 'success'
// (giu cho thanh cong, hien ma dat phong). Chua co VNPay that (Phase 3) nen
// buoc 'success' chi bao "sap co thanh toan", KHONG gia mao 1 nut thanh toan
// khong lam gi ca.
export default function BookingWidget({ listing, checkIn, checkOut }) {
  const { t, i18n } = useTranslation();
  const dateFnsLocale = DATE_FNS_LOCALES[i18n.language] || vi;
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [step, setStep] = useState('review'); // 'review' | 'contact' | 'success'
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

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

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (nights === 0) {
      toast.error(t('listing.booking.selectDatesError'));
      return;
    }
    setStep('contact');
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error(t('listing.booking.contactRequired'));
      return;
    }
    try {
      setSubmitting(true);
      const booking = await createBooking({
        listingId: listing.id,
        checkIn,
        checkOut,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });
      setBookingResult(booking);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.message || t('listing.booking.submitErrorFallback'));
    } finally {
      setSubmitting(false);
    }
  }

  const guestLabel = children > 0
    ? t('listing.booking.adultsChildrenLabel', { adults, children })
    : t('listing.booking.adultsLabel', { count: adults });

  if (step === 'success' && bookingResult) {
    return (
      <div className="rounded-xl border border-neutral-200 p-6 shadow-lg text-center">
        <p className="text-3xl">✅</p>
        <h3 className="mt-2 text-lg font-semibold text-neutral-900">{t('listing.booking.successHeading')}</h3>
        <p className="mt-1 text-sm text-neutral-500">{t('listing.booking.successBody', { minutes: 15 })}</p>

        <div className="mt-4 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
          <p className="text-xs font-semibold uppercase text-neutral-500">{t('listing.booking.bookingCodeLabel')}</p>
          <p className="mt-1 text-2xl font-bold tracking-widest text-neutral-900">{bookingResult.bookingCode}</p>
        </div>

        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-3 text-sm font-semibold text-neutral-900">
          <span>{t('listing.booking.total')}</span>
          <span>{currencyFormatter.format(Number(bookingResult.totalPrice))}</span>
        </div>

        <p className="mt-4 text-xs text-neutral-400">{t('listing.booking.paymentComingSoon')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <p>
          {listing.weekdayPrice !== listing.weekendPrice && (
            <span className="text-neutral-500">{t('listing.priceFrom')} </span>
          )}
          <span className="text-lg font-semibold">{currencyFormatter.format(listing.pricePerNight)}</span>{' '}
          <span className="text-neutral-500">{t('listing.booking.night')}</span>
        </p>
        {listing.rating != null && (
          <span className="flex items-center gap-1 text-sm">
            <StarIcon className="h-3.5 w-3.5" />
            {listing.rating.toFixed(2)}
          </span>
        )}
      </div>

      {step === 'review' && (
        <form onSubmit={handleReviewSubmit} className="mt-4">
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
            <div className="border-t border-neutral-300 relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setGuestOpen((o) => !o)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors"
              >
                <span className="block text-[10px] font-semibold uppercase text-neutral-700">{t('listing.booking.guests')}</span>
                <span className="text-sm text-neutral-800">{guestLabel}</span>
              </button>

              {/* Dropdown */}
              {guestOpen && (
                <div className="absolute left-0 right-0 top-full z-20 bg-white border border-neutral-200 rounded-b-lg shadow-lg px-4 divide-y divide-neutral-100">
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
                    <span>{t('listing.booking.subtotal', { price: currencyFormatter.format(listing.weekdayPrice), nights: weekdayNights })}</span>
                    <span>{currencyFormatter.format(weekdayNights * listing.weekdayPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('listing.booking.subtotal', { price: currencyFormatter.format(listing.weekendPrice), nights: weekendNights })}</span>
                    <span>{currencyFormatter.format(weekendNights * listing.weekendPrice)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>{t('listing.booking.subtotal', { price: currencyFormatter.format(weekendNights > 0 ? listing.weekendPrice : listing.weekdayPrice), nights })}</span>
                  <span>{currencyFormatter.format(subtotal)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
                <span>{t('listing.booking.total')}</span>
                <span>{currencyFormatter.format(subtotal)}</span>
              </div>
            </div>
          )}
        </form>
      )}

      {step === 'contact' && (
        <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-neutral-900">{t('listing.booking.contactHeading')}</p>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
              {t('listing.booking.contactName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
              {t('listing.booking.contactEmail')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">
              {t('listing.booking.contactPhone')}
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submitting ? t('listing.booking.submitting') : t('listing.booking.confirmBooking')}
            </button>
            <button
              type="button"
              onClick={() => setStep('review')}
              disabled={submitting}
              className="text-sm font-semibold text-neutral-500 hover:underline"
            >
              {t('common.back')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
