import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Seo from '../../components/common/Seo';
import CategoryTabs from '../../components/common/CategoryTabs';
import ListingCard from '../../components/listing/ListingCard';
import { getPublicListings } from '../../services/listingService';

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 py-16 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-100 mb-3">
          Chào mừng đến với Stayhub
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Tìm chỗ ở hoàn hảo<br className="hidden sm:block" /> cho chuyến đi của bạn
        </h1>
        <p className="mt-4 text-base text-teal-50 max-w-xl mx-auto">
          Căn hộ, villa, homestay và hơn thế nữa — đặt phòng dễ dàng, giá tốt nhất.
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
        title="Trang chủ"
        description="Tìm và đặt căn hộ, nhà nguyên căn, villa, homestay khắp Việt Nam."
        path="/"
      />

      <Hero />
      <CategoryTabs active={category} onChange={setCategory} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <ul className="grid list-none grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i}><SkeletonCard /></li>
            ))}
          </ul>
        ) : listings.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-neutral-600 font-medium">Không có chỗ ở nào trong danh mục này</p>
            <p className="text-sm text-neutral-400 mt-1">Thử chọn danh mục khác nhé</p>
          </div>
        ) : (
          <section aria-label="Kết quả tìm kiếm chỗ ở">
            <p className="text-sm text-neutral-500 mb-6">
              {listings.length} chỗ ở được tìm thấy
            </p>
            <ul className="grid list-none grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
