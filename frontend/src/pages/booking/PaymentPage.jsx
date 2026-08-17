import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import Seo from '../../components/common/Seo';
import BookingStepper from '../../components/booking/BookingStepper';
import { getBookingById } from '../../services/bookingService';
import { createPaymentUrl } from '../../services/paymentService';

const DATE_FNS_LOCALES = { vi, en: enUS };

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

// Dem nguoc toi paymentExpiresAt - chi de hien UI, KHONG tu huy booking o FE
// (Phase 5 - job tu huy qua han van chua lam, xem TODO.md). Het gio o day chi
// tat nut thanh toan, booking o backend van con o pending_payment cho toi khi
// co Phase 5.
function useCountdown(targetIso) {
  const [remainingMs, setRemainingMs] = useState(() => (targetIso ? new Date(targetIso).getTime() - Date.now() : 0));

  useEffect(() => {
    if (!targetIso) return undefined;
    setRemainingMs(new Date(targetIso).getTime() - Date.now());
    const id = setInterval(() => {
      setRemainingMs(new Date(targetIso).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remainingMs;
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Phase 4 - trang thanh toan rieng, co URL that (/booking/:bookingId/payment)
// thay vi 1 buoc cuc bo trong BookingWidget - song sot duoc F5 vi luon tai
// lai booking tu backend (GET /api/bookings/:id da co san tu Phase 2).
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = DATE_FNS_LOCALES[i18n.language] || vi;
  const [redirecting, setRedirecting] = useState(false);

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId),
    retry: false,
  });

  const remainingMs = useCountdown(booking?.status === 'pending_payment' ? booking.paymentExpiresAt : null);
  const isExpired = booking?.status === 'pending_payment' && remainingMs <= 0;

  async function handlePayNow() {
    try {
      setRedirecting(true);
      const url = await createPaymentUrl(booking.id, i18n.language);
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || t('payment.urlErrorFallback'));
      setRedirecting(false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-neutral-500">{t('common.loading')}</div>;
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-3xl">🔍</p>
        <p className="mt-2 text-lg font-semibold text-neutral-900">{t('payment.notFoundHeading')}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 text-sm font-semibold text-brand-600 underline"
        >
          {t('payment.backHome')}
        </button>
      </div>
    );
  }

  const thumbnail = booking.listing?.images?.[0]?.imageUrl;
  const notPayable = ['expired', 'canceled', 'rejected'].includes(booking.status);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Seo title={t('payment.pageTitle')} noindex />
      <BookingStepper current="payment" />

      <h1 className="text-xl font-semibold text-neutral-900">{t('payment.heading')}</h1>

      <div className="mt-6 rounded-xl border border-neutral-200 p-5 shadow-sm">
        <div className="flex gap-3">
          {thumbnail && (
            <img src={thumbnail} alt={booking.listing?.title} className="h-16 w-16 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{booking.listing?.title}</p>
            <p className="truncate text-xs text-neutral-500">{booking.listing?.address}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('listing.booking.checkIn')}</p>
            <p className="text-neutral-800">
              {format(parseISO(booking.checkIn), 'd MMM yyyy', { locale: dateFnsLocale })}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('listing.booking.checkOut')}</p>
            <p className="text-neutral-800">
              {format(parseISO(booking.checkOut), 'd MMM yyyy', { locale: dateFnsLocale })}
            </p>
          </div>
          {booking.adultsCount != null && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('listing.booking.guests')}</p>
              <p className="text-neutral-800">
                {booking.childrenCount > 0
                  ? t('listing.booking.adultsChildrenLabel', { adults: booking.adultsCount, children: booking.childrenCount })
                  : t('listing.booking.adultsLabel', { count: booking.adultsCount })}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">{t('listing.booking.bookingCodeLabel')}</p>
          <p className="mt-1 text-xl font-bold tracking-widest text-neutral-900">{booking.bookingCode}</p>
        </div>

        <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 text-sm font-semibold text-neutral-900">
          <span>{t('listing.booking.total')}</span>
          <span>{currencyFormatter.format(Number(booking.totalPrice))}</span>
        </div>
      </div>

      {booking.status === 'confirmed' && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
          {t('payment.alreadyConfirmed')}
        </div>
      )}

      {booking.status === 'pending_payment' && !isExpired && (
        <>
          <p className="mt-6 text-center text-sm text-neutral-500">
            {t('payment.holdNotice', { time: formatCountdown(remainingMs) })}
          </p>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={redirecting}
            className="mt-3 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {redirecting ? t('listing.booking.redirecting') : t('listing.booking.payNow')}
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">{t('listing.booking.sandboxNote')}</p>
        </>
      )}

      {booking.status === 'pending_payment' && isExpired && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {t('payment.expired')}
        </div>
      )}

      {notPayable && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {t('payment.notPayable')}
        </div>
      )}
    </div>
  );
}
