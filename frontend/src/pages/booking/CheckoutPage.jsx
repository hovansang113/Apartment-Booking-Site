import { useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import Seo from '../../components/common/Seo';
import BookingStepper from '../../components/booking/BookingStepper';
import { getListingById } from '../../services/listingService';
import { createBooking } from '../../services/bookingService';
import { nightlyBreakdown } from '../../utils/bookingPricing';

const DATE_FNS_LOCALES = { vi, en: enUS };

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
    hasError ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'
  }`;

// Buoc "checkout" that - trang rieng, toan man hinh (khac voi truoc day nhet
// form lien he vao trong the nho BookingWidget o sidebar). Bo cuc 2 cot +
// stepper + validate tung o ngay tren form tham khao truc tiep tu
// booking-directly.com (widget dat phong that cua 1 nen tang khac, anh Sang
// gui lam mau) - rut gon field cho phu hop (bo First/Surname tach roi, giu 1
// o "Ho va ten" theo dung quy uoc da dung xuyen suot du an).
export default function CheckoutPage() {
  const { id: listingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = DATE_FNS_LOCALES[i18n.language] || vi;

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = Number(searchParams.get('adults') || 1);
  const children = Number(searchParams.get('children') || 0);

  const [form, setForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    contactCity: '',
    contactPostcode: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }

  const {
    data: listing,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => getListingById(listingId),
    retry: false,
  });

  const { weekdayNights, weekendNights, nights, total: subtotal } = useMemo(
    () => (listing ? nightlyBreakdown(checkIn, checkOut, listing.weekdayPrice, listing.weekendPrice) : { nights: 0, total: 0 }),
    [listing, checkIn, checkOut],
  );

  function validate() {
    const next = {};
    if (!form.contactName.trim()) next.contactName = t('checkout.errors.nameRequired');
    if (!form.contactEmail.trim()) next.contactEmail = t('checkout.errors.emailRequired');
    else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) next.contactEmail = t('checkout.errors.emailInvalid');
    if (!form.contactAddress.trim()) next.contactAddress = t('checkout.errors.addressRequired');
    if (!form.contactCity.trim()) next.contactCity = t('checkout.errors.cityRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error(t('listing.booking.contactRequired'));
      return;
    }
    try {
      setSubmitting(true);
      const booking = await createBooking({
        listingId,
        checkIn,
        checkOut,
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        contactAddress: form.contactAddress.trim(),
        contactCity: form.contactCity.trim(),
        contactPostcode: form.contactPostcode.trim(),
      });
      navigate(`/booking/${booking.id}/payment`);
    } catch (err) {
      toast.error(err.response?.data?.message || t('listing.booking.submitErrorFallback'));
      setSubmitting(false);
    }
  }

  if (!checkIn || !checkOut) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-semibold text-neutral-900">{t('checkout.missingDatesHeading')}</p>
        <button
          type="button"
          onClick={() => navigate(`/listings/${listingId}`)}
          className="mt-4 text-sm font-semibold text-brand-600 underline"
        >
          {t('checkout.backToListing')}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-neutral-500">{t('common.loading')}</div>;
  }

  if (isError || !listing) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-semibold text-neutral-900">{t('checkout.listingNotFoundHeading')}</p>
        <button type="button" onClick={() => navigate('/')} className="mt-4 text-sm font-semibold text-brand-600 underline">
          {t('payment.backHome')}
        </button>
      </div>
    );
  }

  const thumbnail = listing.images?.[0];
  const guestLabel = children > 0
    ? t('listing.booking.adultsChildrenLabel', { adults, children })
    : t('listing.booking.adultsLabel', { count: adults });
  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Seo title={t('checkout.pageTitle')} noindex />
      <BookingStepper current="guest" />

      <button
        type="button"
        onClick={() => navigate(`/listings/${listingId}`)}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900"
      >
        ‹ {t('common.back')}
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <h1 className="text-xl font-semibold text-neutral-900">{t('checkout.heading')}</h1>
          <p className="text-sm text-neutral-500">{t('checkout.subheading')}</p>

          <Field label={t('listing.booking.contactName')} required error={errors.contactName}>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => setField('contactName', e.target.value)}
              className={inputClass(errors.contactName)}
            />
          </Field>

          <Field label={t('listing.booking.contactEmail')} required error={errors.contactEmail}>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setField('contactEmail', e.target.value)}
              className={inputClass(errors.contactEmail)}
            />
          </Field>

          <Field label={t('listing.booking.contactPhone')} error={errors.contactPhone}>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setField('contactPhone', e.target.value)}
              className={inputClass(errors.contactPhone)}
            />
          </Field>

          <Field label={t('checkout.address')} required error={errors.contactAddress}>
            <input
              type="text"
              value={form.contactAddress}
              onChange={(e) => setField('contactAddress', e.target.value)}
              className={inputClass(errors.contactAddress)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('checkout.city')} required error={errors.contactCity}>
              <input
                type="text"
                value={form.contactCity}
                onChange={(e) => setField('contactCity', e.target.value)}
                className={inputClass(errors.contactCity)}
              />
            </Field>
            <Field label={t('checkout.postcode')} error={errors.contactPostcode}>
              <input
                type="text"
                value={form.contactPostcode}
                onChange={(e) => setField('contactPostcode', e.target.value)}
                className={inputClass(errors.contactPostcode)}
              />
            </Field>
          </div>
        </form>

        {/* Summary card - sticky, tham khao bo cuc "1 Night Stay" cua trang mau */}
        <aside className="h-fit lg:sticky lg:top-6">
          <div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
            <div className="flex gap-3">
              {thumbnail && <img src={thumbnail} alt={listing.title} className="h-16 w-16 rounded-lg object-cover" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{listing.title}</p>
                <p className="truncate text-xs text-neutral-500">{listing.address}</p>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-neutral-900">
              {t('checkout.nightsStay', { count: nights })}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('listing.booking.checkIn')}</p>
                <p className="text-sm font-semibold text-neutral-900">{format(checkInDate, 'd MMM yyyy', { locale: dateFnsLocale })}</p>
                <p className="text-xs text-neutral-400 capitalize">{format(checkInDate, 'EEEE', { locale: dateFnsLocale })}</p>
              </div>
              <div className="relative mx-1 h-px flex-1 bg-brand-500">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-brand-500">➜</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('listing.booking.checkOut')}</p>
                <p className="text-sm font-semibold text-neutral-900">{format(checkOutDate, 'd MMM yyyy', { locale: dateFnsLocale })}</p>
                <p className="text-xs text-neutral-400 capitalize">{format(checkOutDate, 'EEEE', { locale: dateFnsLocale })}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-4">
              <p className="text-xs font-semibold uppercase text-neutral-500">{t('checkout.roomsHeading')}</p>
              <div className="mt-2 flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">{listing.title}</p>
                  <p className="text-xs text-neutral-500">{guestLabel}</p>
                </div>
                <span className="whitespace-nowrap font-semibold text-neutral-900">{currencyFormatter.format(subtotal)}</span>
              </div>
            </div>

            {nights > 0 && weekdayNights > 0 && weekendNights > 0 && (
              <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>{t('listing.booking.subtotal', { price: currencyFormatter.format(listing.weekdayPrice), nights: weekdayNights })}</span>
                  <span>{currencyFormatter.format(weekdayNights * listing.weekdayPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('listing.booking.subtotal', { price: currencyFormatter.format(listing.weekendPrice), nights: weekendNights })}</span>
                  <span>{currencyFormatter.format(weekendNights * listing.weekendPrice)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900">
              <span>{t('listing.booking.total')}</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? t('listing.booking.submitting') : t('checkout.continue')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
