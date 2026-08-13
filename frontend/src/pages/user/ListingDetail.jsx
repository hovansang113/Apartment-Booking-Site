import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';
import Gallery from '../../components/listing/Gallery';
import AmenityList from '../../components/listing/AmenityList';
import AvailabilityCalendar from '../../components/listing/AvailabilityCalendar';
import BookingWidget from '../../components/listing/BookingWidget';
import { HeartIcon, StarIcon } from '../../components/common/icons';
import { getListingById } from '../../services/listingService';

export default function ListingDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingById(id),
    retry: false,
  });

  function handleSelectDate(dateStr) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else if (dateStr <= checkIn) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      setCheckOut(dateStr);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-neutral-500">{t('common.loading')}</p>
      </main>
    );
  }

  if (isError || !listing) {
    return (
      <>
        <Seo title={t('listing.notFoundTitle')} path={`/listings/${id}`} noindex />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">{t('listing.notFoundTitle')}</h1>
          <p className="mt-2 text-neutral-500">{t('listing.notFoundBody')}</p>
          <Link to="/" className="mt-6 inline-block text-brand-600 underline">
            {t('listing.backHome')}
          </Link>
        </main>
      </>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: listing.pricePerNight,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Seo
        title={listing.title}
        description={listing.description}
        path={`/listings/${listing.id}`}
        jsonLd={jsonLd}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{listing.title}</h1>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-neutral-700">
            {listing.rating != null && (
              <span className="flex items-center gap-1">
                <StarIcon className="h-4 w-4" />
                {listing.rating.toFixed(2)}
              </span>
            )}
            <span className="underline">{listing.address}</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:underline"
          >
            <HeartIcon className="h-5 w-5 text-brand-600" />
            {t('listing.saveBtn')}
          </button>
        </div>

        <div className="mt-4">
          <Gallery images={listing.images} title={listing.title} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="border-b border-neutral-200 pb-6">
              {listing.host && (
                <h2 className="text-xl font-semibold text-neutral-900">
                  {t('listing.hostedBy', { name: listing.host.name })}
                  {listing.host.isSuperhost && (
                    <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {t('listing.superhost')}
                    </span>
                  )}
                </h2>
              )}
              <p className="mt-1 text-neutral-500">
                {t('listing.capacitySummary', {
                  guests: listing.guestCapacity,
                  bedrooms: listing.bedrooms,
                  beds: listing.beds,
                  bathrooms: listing.bathrooms,
                })}
              </p>
            </div>

            <section aria-labelledby="description-heading" className="border-b border-neutral-200 py-8">
              <h2 id="description-heading" className="sr-only">
                {t('listing.descriptionHeading')}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-neutral-700">
                {listing.description}
              </p>
            </section>

            <AmenityList amenities={listing.amenities} />

            <AvailabilityCalendar
              bookedRanges={listing.bookedRanges}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDate={handleSelectDate}
            />
          </div>

          <div>
            <div className="sticky top-24">
              <BookingWidget
                listing={listing}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
