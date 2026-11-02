import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';
import { useAuth } from '../../context/AuthContext';
import { getMyGuestBookings } from '../../services/bookingService';
import { formatPrice } from '../../utils/currency';

function BookingCard({ booking, t }) {
  const image = booking.listing.images?.[0]?.thumbUrl || booking.listing.images?.[0]?.imageUrl;
  const pendingPayment = booking.status === 'pending_payment';

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-4 sm:flex-row sm:items-center sm:p-5">
      {image ? (
        <img src={image} alt="" className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-28" />
      ) : (
        <div className="h-24 w-full rounded-xl bg-neutral-100 sm:h-20 sm:w-28" />
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold text-neutral-900">{booking.listing.title}</h2>
        <p className="truncate text-sm text-neutral-500">{booking.listing.address}</p>
        <p className="mt-1 text-sm text-neutral-700">
          {format(new Date(booking.checkIn), 'd MMM yyyy')} – {format(new Date(booking.checkOut), 'd MMM yyyy')}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          {t('trips.bookingCode', { code: booking.bookingCode })} · {t(`trips.status.${booking.status}`, { defaultValue: booking.status })}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <p className="font-semibold text-neutral-900">{formatPrice(Number(booking.totalPrice))}</p>
        {pendingPayment && (
          <Link
            to={`/booking/${booking.id}/payment`}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t('trips.completePayment')}
          </Link>
        )}
      </div>
    </article>
  );
}

export default function GuestTripsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['guest-bookings', user?.id],
    queryFn: getMyGuestBookings,
  });

  return (
    <>
      <Seo title={t('trips.pageTitle')} noindex />
      <main className="mx-auto min-h-[75vh] max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900 sm:text-3xl">{t('trips.heading')}</h1>
        {isLoading && <p className="text-sm text-neutral-500">{t('common.loading')}</p>}
        {isError && <p role="alert" className="text-sm text-red-600">{t('trips.loadError')}</p>}
        {!isLoading && !isError && bookings?.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 p-8 text-center">
            <p className="font-semibold text-neutral-900">{t('trips.emptyTitle')}</p>
            <p className="mt-2 text-sm text-neutral-500">{t('trips.emptyBody')}</p>
            <Link to="/" className="mt-5 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
              {t('trips.browseStays')}
            </Link>
          </div>
        )}
        {!isLoading && !isError && bookings?.length > 0 && (
          <div className="space-y-3">
            {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} t={t} />)}
          </div>
        )}
      </main>
    </>
  );
}
