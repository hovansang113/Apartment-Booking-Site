import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';
import CategoryTabs from '../../components/common/CategoryTabs';
import ListingCard from '../../components/listing/ListingCard';
import { getPublicListings } from '../../services/listingService';

// An tam thanh loc category theo yeu cau Jason (19/8) - it listing that nen
// chua can chia theo loai. Doi lai true khi can bat lai, khong xoa code.
const SHOW_CATEGORY_TABS = true;

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-neutral-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
        <div className="h-3 w-1/2 rounded bg-neutral-200" />
        <div className="h-3.5 w-1/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const location = searchParams.get('location') || '';
  const guests = Number(searchParams.get('guests')) || null;
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const amenities = (searchParams.get('amenities') || '').split(',').filter(Boolean);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const [priceRange, setPriceRange] = useState({ minPrice, maxPrice });
  const [priceError, setPriceError] = useState('');
  const hasActiveFilters = category !== 'all' || Boolean(location) || Boolean(guests) ||
    Boolean(checkIn || checkOut) || amenities.length > 0 || Boolean(minPrice || maxPrice);

  useEffect(() => {
    setPriceRange({ minPrice, maxPrice });
  }, [minPrice, maxPrice]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-listings', category, page, location, guests, checkIn, checkOut, amenities, minPrice, maxPrice],
    queryFn: () => getPublicListings({
      category: category === 'all' ? undefined : category,
      page,
      location: location || undefined,
      guests: guests || undefined,
      amenities,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    }),
  });

  const listings = useMemo(() => {
    if (data?.listings) return data.listings;
    return [];
  }, [data]);

  function updateSearchParams(updates) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') next.delete(key);
        else next.set(key, String(value));
      });
      next.delete('page');
      return next;
    });
  }

  function toggleAmenity(amenity) {
    const next = amenities.includes(amenity)
      ? amenities.filter((value) => value !== amenity)
      : [...amenities, amenity];
    updateSearchParams({ amenities: next.length ? next.join(',') : null });
  }

  function clearFilters() {
    setPriceError('');
    setPriceRange({ minPrice: '', maxPrice: '' });
    setSearchParams({});
  }

  function applyPriceRange(event) {
    event.preventDefault();
    if (priceRange.minPrice && priceRange.maxPrice && Number(priceRange.minPrice) > Number(priceRange.maxPrice)) {
      setPriceError(t('home.invalidPriceRange'));
      return;
    }
    setPriceError('');
    updateSearchParams({
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
    });
  }

  function changePage(nextPage) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('page', String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${window.location.origin}/listings/${listing.id}`,
      name: listing.title,
    })),
  };

  return (
    <>
      <Seo
        title={t('home.seoTitle')}
        description={t('home.seoDescription')}
        path="/"
        jsonLd={jsonLd}
      />

      {SHOW_CATEGORY_TABS && (
        <CategoryTabs
          active={category}
          onChange={(value) => updateSearchParams({ category: value === 'all' ? null : value })}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="sr-only">{t('home.srHeading')}</h1>
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-semibold text-neutral-700">{t('home.amenitiesFilter')}</legend>
          <div className="flex flex-wrap gap-2">
            {['wifi', 'kitchen', 'washer', 'air_conditioning', 'free_parking', 'pool', 'tv', 'workspace'].map((amenity) => (
              <label
                key={amenity}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  amenities.includes(amenity)
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-500'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {t(`listing.amenities.${amenity}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <form onSubmit={applyPriceRange} className="mb-6 max-w-xl">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-neutral-700">{t('home.priceRangeFilter')}</legend>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                {t('home.minimumPrice')}
                <span className="flex items-center rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700">
                  £
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceRange.minPrice}
                    onChange={(event) => setPriceRange((current) => ({ ...current, minPrice: event.target.value }))}
                    className="w-28 border-0 bg-transparent px-2 py-2 outline-none"
                    aria-label={t('home.minimumPrice')}
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                {t('home.maximumPrice')}
                <span className="flex items-center rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700">
                  £
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceRange.maxPrice}
                    onChange={(event) => setPriceRange((current) => ({ ...current, maxPrice: event.target.value }))}
                    className="w-28 border-0 bg-transparent px-2 py-2 outline-none"
                    aria-label={t('home.maximumPrice')}
                  />
                </span>
              </label>
              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
              >
                {t('home.applyPriceRange')}
              </button>
            </div>
            {priceError && <p role="alert" className="mt-2 text-sm text-red-600">{priceError}</p>}
          </fieldset>
        </form>

        {isLoading ? (
          <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i}><SkeletonCard /></li>
            ))}
          </ul>
        ) : isError ? (
          <div role="alert" className="py-16 text-center">
            <p className="font-medium text-red-600">{t('home.loadError')}</p>
            <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-brand-600 underline">
              {t('home.tryAgain')}
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-500 font-medium">{t('home.noResults')}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm font-semibold text-brand-600 underline hover:text-brand-700"
              >
                {t('home.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <section aria-label={t('home.resultsAriaLabel')}>
            <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {!isLoading && data?.totalPages > 1 && (
        <nav aria-label={t('home.paginationAriaLabel')} className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('home.previousPage')}
          </button>
          <span className="text-sm text-neutral-600">{t('home.pageOf', { page, total: data.totalPages })}</span>
          <button
            type="button"
            onClick={() => changePage(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('home.nextPage')}
          </button>
        </nav>
        )}
      </main>
    </>
  );
}
