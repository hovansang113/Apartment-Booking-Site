import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon } from '../common/icons';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const CATEGORY_LABELS = {
  apartment: 'Căn hộ',
  house: 'Nhà nguyên căn',
  villa: 'Villa',
  homestay: 'Homestay',
  hotel_room: 'Phòng khách sạn',
};

export default function ListingCard({ listing }) {
  const [saved, setSaved] = useState(false);
  const image = listing.images?.[0]?.imageUrl ?? listing.image;
  const price = listing.defaultPrice ?? listing.pricePerNight;
  const categoryLabel = CATEGORY_LABELS[listing.category] ?? listing.category;

  return (
    <article className="group">
      <Link to={`/listings/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
          {image ? (
            <img
              src={image}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
              Không có ảnh
            </div>
          )}

          {/* Category badge */}
          {categoryLabel && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-neutral-700 shadow-sm">
              {categoryLabel}
            </span>
          )}

          {/* Heart button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSaved((s) => !s);
            }}
            aria-pressed={saved}
            aria-label={saved ? 'Bỏ lưu' : 'Lưu'}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
          >
            <HeartIcon filled={saved} className={`h-4 w-4 ${saved ? 'text-rose-500' : 'text-neutral-600'}`} />
          </button>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-neutral-900 leading-snug">
              {listing.title}
            </h3>
            {listing.rating != null && (
              <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-neutral-700">
                <StarIcon className="h-3 w-3 text-amber-400" />
                {listing.rating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="truncate text-xs text-neutral-500">{listing.address}</p>

          <p className="pt-1 text-sm text-neutral-900">
            <span className="font-semibold">{currencyFormatter.format(price)}</span>
            <span className="text-neutral-500 font-normal"> / đêm</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
