import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import dropin from 'braintree-web-drop-in';
import Seo from '../../components/common/Seo';
import BookingStepper from '../../components/booking/BookingStepper';
import { getBookingById } from '../../services/bookingService';
import { getClientToken, checkout } from '../../services/paymentService';
import { formatPrice } from '../../utils/currency';
import { CheckCircleIcon, SearchOffIcon } from '../../components/common/icons';

// Dem nguoc toi paymentExpiresAt - chi de hien UI, KHONG tu huy booking o FE
// (Phase 5 - job tu huy qua han van chua lam, xem TODO.md). Het gio o day chi
// tat form thanh toan, booking o backend van con o pending_payment cho toi khi
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

// Trang thanh toan rieng, co URL that (/booking/:bookingId/payment) - song sot
// duoc F5 vi luon tai lai booking tu backend. Nhung tien Braintree (thay VNPay,
// 18/8): Drop-in UI nhung the ngay tai trang nay, kem challenge 3D Secure bat
// buoc ("extra step of confirming payment through app" theo yeu cau Jason) -
// khong con redirect sang trang ngoai + trang "return" rieng nua, ket qua
// tra ve dong bo ngay trong 1 lan goi API.
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dateFnsLocale = enUS;
  const dropinContainerRef = useRef(null);
  const dropinInstanceRef = useRef(null);
  const [dropinReady, setDropinReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // null | { status: 'success' | 'declined', message, bookingCode }

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
  const canPay = booking?.status === 'pending_payment' && !isExpired && !result;

  const {
    data: clientToken,
    isError: isClientTokenError,
    isLoading: isClientTokenLoading,
  } = useQuery({
    queryKey: ['braintree-client-token'],
    queryFn: getClientToken,
    enabled: canPay,
    staleTime: Infinity,
    retry: 1,
  });

  // Khoi tao Braintree Drop-in UI ngay khi co client token + booking con thanh
  // toan duoc. Teardown luc unmount de tranh giu ket noi/form the con song sau
  // khi roi trang.
  useEffect(() => {
    if (!clientToken || !canPay || !dropinContainerRef.current) return undefined;

    let cancelled = false;
    dropin
      .create({ authorization: clientToken, container: dropinContainerRef.current, threeDSecure: true })
      .then((instance) => {
        if (cancelled) {
          instance.teardown();
          return;
        }
        dropinInstanceRef.current = instance;
        setDropinReady(true);
      })
      .catch(() => {
        if (!cancelled) toast.error(t('payment.dropinErrorFallback'));
      });

    return () => {
      cancelled = true;
      if (dropinInstanceRef.current) {
        dropinInstanceRef.current.teardown().catch(() => {});
        dropinInstanceRef.current = null;
      }
      setDropinReady(false);
    };
  }, [clientToken, canPay, t]);

  async function handlePayNow() {
    if (!dropinInstanceRef.current) return;
    try {
      setSubmitting(true);
      const payload = await dropinInstanceRef.current.requestPaymentMethod({
        threeDSecure: {
          amount: Number(booking.totalPrice).toFixed(2),
          email: booking.contactEmail,
        },
      });

      const res = await checkout(booking.id, { paymentMethodNonce: payload.nonce, deviceData: payload.deviceData });

      if (res.paymentStatus === 'success') {
        setResult({ status: 'success' });
      } else {
        // Nhap the sai/bi tu choi - can form moi de thu lai (nonce da dung 1
        // lan la het han), teardown + tao lai dropin ngay duoi day.
        toast.error(res.message || t('payment.declinedFallback'));
        if (dropinInstanceRef.current) {
          await dropinInstanceRef.current.teardown().catch(() => {});
          dropinInstanceRef.current = null;
          setDropinReady(false);
          const instance = await dropin.create({
            authorization: clientToken,
            container: dropinContainerRef.current,
            threeDSecure: true,
          });
          dropinInstanceRef.current = instance;
          setDropinReady(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('payment.urlErrorFallback'));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-neutral-500">{t('common.loading')}</div>;
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <SearchOffIcon className="mx-auto h-10 w-10 text-neutral-300" />
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
      <BookingStepper current="payment" completed={result?.status === 'success' || booking.status === 'confirmed'} />

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

        {Number(booking.cleaningFee) > 0 && (
          <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            <span>{t('listing.booking.cleaningFee')}</span>
            <span>{formatPrice(Number(booking.cleaningFee))}</span>
          </div>
        )}

        <div className="mt-3 flex justify-between border-t border-neutral-100 pt-3 text-sm font-semibold text-neutral-900">
          <span>{t('listing.booking.total')}</span>
          <span>{formatPrice(Number(booking.totalPrice))}</span>
        </div>
      </div>

      {result?.status === 'success' ? (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-600" />
          <p className="mt-2 text-sm font-semibold text-green-800">{t('payment.successHeading')}</p>
          <p className="mt-1 text-sm text-green-700">
            {t('payment.successBody', { email: booking.contactEmail })}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            {t('payment.backToHome')}
          </button>
        </div>
      ) : (
        booking.status === 'confirmed' && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
            {t('payment.alreadyConfirmed')}
          </div>
        )
      )}

      {canPay && (
        <>
          <p className="mt-6 text-center text-sm text-neutral-500">
            {t('payment.holdNotice', { time: formatCountdown(remainingMs) })}
          </p>

          {isClientTokenError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
              {t('payment.dropinErrorFallback')}
            </div>
          ) : isClientTokenLoading ? (
            <p className="mt-4 text-center text-sm text-neutral-400">{t('common.loading')}</p>
          ) : (
            <>
              <div ref={dropinContainerRef} className="mt-4" />

              <button
                type="button"
                onClick={handlePayNow}
                disabled={!dropinReady || submitting}
                className="mt-3 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? t('listing.booking.redirecting') : t('listing.booking.payNow')}
              </button>
              <p className="mt-3 text-center text-xs text-neutral-400">{t('payment.threeDSecureNote')}</p>
            </>
          )}
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
