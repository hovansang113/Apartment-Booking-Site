import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Seo from '../../components/common/Seo';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { BookIllustration, CalculatorIcon } from '../../components/common/icons';
import { getMyBookings } from '../../services/bookingService';
import { formatDateRange } from '../../utils/formatDateRange';
import { formatPrice } from '../../utils/currency';

function toYMD(date) {
  return format(date, 'yyyy-MM-dd');
}

function nightsBetween(checkIn, checkOut) {
  return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
}

function BookingCard({ booking, onClick }) {
  const thumbnail = booking.listing?.images?.[0]?.imageUrl;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-neutral-200 p-4 text-left transition-colors hover:bg-neutral-50 sm:p-5"
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover sm:h-20 sm:w-20" />
      ) : (
        <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-neutral-100 sm:h-20 sm:w-20" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900 sm:text-base">{booking.contactName}</p>
        <p className="truncate text-xs text-neutral-500 sm:text-sm">{booking.listing?.title}</p>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          {formatDateRange({ checkIn: new Date(booking.checkIn), checkOut: new Date(booking.checkOut) })}
        </p>
      </div>
      <p className="flex-shrink-0 text-sm font-semibold text-neutral-900 sm:text-base">
        {formatPrice(booking.totalPrice)}
      </p>
    </button>
  );
}

function BookingDetail({ booking, hostName, onClose, t }) {
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const guestsLabel =
    booking.childrenCount > 0
      ? t('host.today.guestsCountWithChildren', {
          adults: t('host.today.guestsCount', { count: booking.adultsCount }),
          count: booking.childrenCount,
        })
      : t('host.today.guestsCount', { count: booking.adultsCount });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{booking.contactName}</h2>
            <p className="text-sm text-neutral-500">{booking.listing?.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label={t('host.today.close')}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex divide-x divide-neutral-200 rounded-2xl border border-neutral-200">
          <div className="flex-1 p-4">
            <p className="text-xs font-medium text-neutral-500">Check-in</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {format(new Date(booking.checkIn), 'EEE, d MMM', { locale: enUS })}
            </p>
          </div>
          <div className="flex-1 p-4">
            <p className="text-xs font-medium text-neutral-500">Checkout</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {format(new Date(booking.checkOut), 'EEE, d MMM', { locale: enUS })}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs font-medium text-neutral-500">Guests</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">{guestsLabel}</p>
        </div>

        <div className="mb-4 rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs font-medium text-neutral-500">{t('host.today.hostedBy', { name: hostName })}</p>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm font-semibold text-neutral-900">{formatPrice(booking.totalPrice)}</p>
          <p className="text-xs text-neutral-500">{t('host.today.nightsTotal', { count: nights })}</p>
        </div>

        <div className="mb-4 rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs font-medium text-neutral-500">{t('host.today.bookingDate')}</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">
            {format(new Date(booking.createdAt), 'EEEE, d MMMM yyyy', { locale: enUS })}
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs font-medium text-neutral-500">{t('host.today.confirmationCode')}</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">{booking.bookingCode}</p>
        </div>

        <a
          href={`mailto:${booking.contactEmail}`}
          className="block w-full rounded-2xl bg-neutral-900 px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          {t('host.today.emailGuest')}
        </a>
      </div>
    </div>
  );
}

export default function HostTodayPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming'
  const [showTaxNotice, setShowTaxNotice] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['host-bookings'],
    queryFn: getMyBookings,
  });

  const { todayBookings, upcomingBookings } = useMemo(() => {
    if (!bookings) return { todayBookings: [], upcomingBookings: [] };
    const todayYMD = toYMD(new Date());
    const today = [];
    const upcoming = [];
    for (const booking of bookings) {
      const checkInYMD = toYMD(new Date(booking.checkIn));
      const checkOutYMD = toYMD(new Date(booking.checkOut));
      if (checkInYMD <= todayYMD && todayYMD <= checkOutYMD) {
        today.push(booking);
      } else if (checkInYMD > todayYMD) {
        upcoming.push(booking);
      }
    }
    return { todayBookings: today, upcomingBookings: upcoming };
  }, [bookings]);

  const visibleBookings = activeTab === 'today' ? todayBookings : upcomingBookings;
  const hasAnyBookings = bookings && bookings.length > 0;

  return (
    <>
      <Seo title={t('host.today.pageTitle')} noindex />

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Top Banner Notice Card */}
          {showTaxNotice && (
            <div className="mb-10 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all sm:p-5">
              <Link to="/host/settings/tax" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <CalculatorIcon />
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">
                    {t('host.taxNotice.title')}
                  </h2>
                  <p className="text-xs text-neutral-500 sm:text-sm">
                    {t('host.taxNotice.body')}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setShowTaxNotice(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label={t('host.taxNotice.close')}
              >
                ✕
              </button>
            </div>
          )}

          {/* Sub-tabs Capsule Selectors */}
          <div className="mb-12 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('host.today.tabToday')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('host.today.tabUpcoming')}
            </button>
          </div>

          {isLoading && <p className="text-center text-sm text-neutral-500">{t('host.today.loading')}</p>}

          {isError && (
            <p className="text-center text-sm text-red-600">{t('host.today.loadErrorFallback')}</p>
          )}

          {!isLoading && !isError && hasAnyBookings && visibleBookings.length > 0 && (
            <div className="space-y-3">
              {visibleBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
              ))}
            </div>
          )}

          {/* Empty State Section - no bookings at all, or none in this tab */}
          {!isLoading && !isError && (!hasAnyBookings || visibleBookings.length === 0) && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <BookIllustration className="h-32 w-32 sm:h-36 sm:w-36 mb-6" />

              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                {t('host.today.emptyTitle')}
              </h1>

              <p className="mt-3 text-sm text-neutral-500 sm:text-base max-w-md">
                {t('host.today.emptyBodyNoDraft')}
              </p>

              <Link
                to="/host/listings/setup"
                className="mt-8 rounded-2xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                {t('host.today.createListing')}
              </Link>
            </div>
          )}
        </div>
      </main>

      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          hostName={user?.fullName}
          onClose={() => setSelectedBooking(null)}
          t={t}
        />
      )}
    </>
  );
}
