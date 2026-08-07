import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Seo from '../../components/common/Seo';
import CategoryTabs from '../../components/common/CategoryTabs';
import ListingCard from '../../components/listing/ListingCard';
import { getPublicListings } from '../../services/listingService';

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

      <CategoryTabs active={category} onChange={setCategory} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="sr-only">Danh sách chỗ ở cho thuê tại Việt Nam</h1>

        {isLoading ? (
          <p className="text-center text-neutral-400 py-16">Đang tải...</p>
        ) : (
          <section aria-label="Kết quả tìm kiếm chỗ ở">
            <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
            {listings.length === 0 && (
              <p className="py-16 text-center text-neutral-500">
                Không có chỗ ở nào trong danh mục này.
              </p>
            )}
          </section>
        )}
      </main>
    </>
  );
}
