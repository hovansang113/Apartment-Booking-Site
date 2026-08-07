import { useMemo, useState } from 'react';
import Seo from '../../components/common/Seo';
import CategoryTabs from '../../components/common/CategoryTabs';
import ListingCard from '../../components/listing/ListingCard';
import { mockListings } from '../../data/mockListings';

export default function Home() {
  const [category, setCategory] = useState('all');

  const listings = useMemo(
    () => (category === 'all' ? mockListings : mockListings.filter((l) => l.category === category)),
    [category],
  );

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
        description="Tìm và đặt căn hộ, nhà nguyên căn, villa, homestay khắp Việt Nam. Đặt phòng ngay, không cần chờ chủ nhà duyệt."
        path="/"
        jsonLd={jsonLd}
      />

      <CategoryTabs active={category} onChange={setCategory} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="sr-only">Danh sách chỗ ở cho thuê tại Việt Nam</h1>

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
      </main>
    </>
  );
}
