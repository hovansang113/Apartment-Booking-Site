import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../common/icons';
import { formatPrice } from '../../utils/currency';

function formatDate(ymd) {
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

// Chi xem, khong sua - danh cho ngay da co booking that (click vao thanh
// "Chủ nhà Demo"/ten khach tren luoi lich). Khac voi DayEditModal (block/gia).
export default function BookingDetailModal({ booking, guestName, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900">{t('hostCalendar.bookingModal.heading')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            aria-label={t('hostCalendar.bookingModal.close')}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {(guestName || '?').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-neutral-900">{guestName}</p>
              <p className="text-xs text-neutral-500">{t('hostCalendar.bookingModal.guestBadge')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-400">{t('hostCalendar.bookingModal.checkIn')}</p>
              <p className="font-medium text-neutral-900">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-400">{t('hostCalendar.bookingModal.checkOut')}</p>
              <p className="font-medium text-neutral-900">{formatDate(booking.checkOut)}</p>
            </div>
          </div>

          {booking.adultsCount != null && (
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-400">{t('hostCalendar.bookingModal.guests')}</p>
              <p className="font-medium text-neutral-900">
                {booking.childrenCount > 0
                  ? t('listing.booking.adultsChildrenLabel', { adults: booking.adultsCount, children: booking.childrenCount })
                  : t('listing.booking.adultsLabel', { count: booking.adultsCount })}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase text-neutral-400">{t('hostCalendar.bookingModal.contact')}</p>
            <p className="font-medium text-neutral-900">{booking.contactEmail}</p>
            {booking.contactPhone && <p className="text-neutral-600">{booking.contactPhone}</p>}
          </div>

          <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
            <span className="text-neutral-500">{t('hostCalendar.bookingModal.total')}</span>
            <span className="text-base font-bold text-neutral-900">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
