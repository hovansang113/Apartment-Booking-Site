import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import CategoryTabs from '../../components/common/CategoryTabs';
import ListingCard from '../../components/listing/ListingCard';
import { getPublicListings } from '../../services/listingService';
import { mockListings } from '../../data/mockListings';
import { filterListings } from '../../utils/filterListings';

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
  const [category, setCategory] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const guests = Number(searchParams.get('guests')) || null;
  const hasActiveFilters = category !== 'all' || Boolean(location) || Boolean(guests);

  const { data, isLoading } = useQuery({
    queryKey: ['public-listings', category],
    queryFn: () => getPublicListings({ category: category === 'all' ? undefined : category }),
  });

  const rawListings = useMemo(() => {
    if (data?.listings && data.listings.length > 0) return data.listings;
    return category === 'all' ? mockListings : mockListings.filter((l) => l.category === category);
  }, [data, category]);

  const listings = useMemo(
    () => filterListings(rawListings, { location, guests }),
    [rawListings, location, guests],
  );

  function clearFilters() {
    setCategory('all');
    setSearchParams({});
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://example.com/listings/${listing.id}`,
      name: listing.title,
    })),
  };

  return (
    <>
      <Seo
        title="Trang chủ"
        description="Tìm và đặt căn hộ, nhà nguyên căn, villa, homestay khắp Việt Nam."
        path="/"
        jsonLd={jsonLd}
      />

      <CategoryTabs active={category} onChange={setCategory} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="sr-only">Danh sách chỗ ở cho thuê tại Việt Nam</h1>

        {isLoading ? (
          <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i}><SkeletonCard /></li>
            ))}
          </ul>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-500 font-medium">Không tìm thấy chỗ ở nào phù hợp</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm font-semibold text-brand-600 underline hover:text-brand-700"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : (
          <section aria-label="Kết quả tìm kiếm chỗ ở">
            <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
