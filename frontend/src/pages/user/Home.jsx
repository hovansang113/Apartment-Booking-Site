import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Seo from '../../components/common/Seo';
import CategoryTabs from '../../components/common/CategoryTabs';
import ListingCard from '../../components/listing/ListingCard';
import { getPublicListings } from '../../services/listingService';

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 py-20 text-white">
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 10, color: '#8aad9d', letterSpacing: '0.16em' }}>01</span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#8aad9d' }}>
            Welcome to Stayhub
          </p>
        </div>
        <h1
          className="leading-tight text-3xl sm:text-4xl lg:text-5xl"
          style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, color: '#FAF6EF' }}
        >
          Find your perfect stay<br className="hidden sm:block" /> for every journey
        </h1>
        <p className="mt-5 text-[15px] max-w-xl mx-auto leading-relaxed text-white">
          Apartments, villas, homestays and more — book easily at the best price.
        </p>
      </div>
    </div>
  );
}

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

  const { data, isLoading } = useQuery({
    queryKey: ['public-listings', category],
    queryFn: () => getPublicListings({ category: category === 'all' ? undefined : category }),
  });

  const listings = data?.listings ?? [];

  return (
    <>
      <Seo
        title="Home"
        description="Find and book apartments, houses, villas, homestays across Vietnam."
        path="/"
      />

      <Hero />
      <CategoryTabs active={category} onChange={setCategory} />

      <main className="px-4 py-8 sm:px-8 lg:px-12">
        {isLoading ? (
          <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}><SkeletonCard /></li>
            ))}
          </ul>
        ) : listings.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-neutral-600 font-medium">No listings found in this category</p>
            <p className="text-sm text-neutral-400 mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <section aria-label="Search results">
            <p className="text-sm text-neutral-500 mb-6">
              {listings.length} place{listings.length !== 1 ? 's' : ''} found
            </p>
            <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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
