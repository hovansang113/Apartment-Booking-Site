import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon } from '../common/icons';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const CATEGORY_LABELS = {
  apartment:  'Apartment',
  house:      'Entire house',
  villa:      'Villa',
  homestay:   'Homestay',
  hotel_room: 'Hotel room',
};

export default function ListingCard({ listing }) {
  const [saved, setSaved] = useState(false);
  const image         = listing.images?.[0]?.imageUrl ?? listing.image;
  const price         = listing.defaultPrice ?? listing.pricePerNight;
  const categoryLabel = CATEGORY_LABELS[listing.category] ?? listing.category;

  return (
    <article className="group">
      <Link to={`/listings/${listing.id}`} className="block">
        <div
          className="relative aspect-[4/3] overflow-hidden bg-neutral-100"
          style={{ borderRadius: 10, border: '1px solid #E8E2D9' }}
        >
          {image ? (
            <img
              src={image}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
              No image
            </div>
          )}

          {categoryLabel && (
            <span
              className="absolute left-3 top-3 text-[11px] font-semibold px-2 py-0.5"
              style={{ borderRadius: 4, backgroundColor: '#FAF6EF', color: '#2F4A3E' }}
            >
              {categoryLabel}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setSaved((s) => !s); }}
            aria-pressed={saved}
            aria-label={saved ? 'Unsave' : 'Save'}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center transition-colors"
            style={{ borderRadius: 4, backgroundColor: saved ? 'rgba(47,74,62,0.12)' : 'transparent' }}
            onMouseEnter={(e) => { if (!saved) e.currentTarget.style.backgroundColor = 'rgba(47,74,62,0.08)'; }}
            onMouseLeave={(e) => { if (!saved) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <HeartIcon
              filled={saved}
              className="h-4 w-4"
              style={{ color: saved ? '#C17A54' : '#2F4A3E', strokeWidth: 1.5 }}
            />
          </button>
        </div>

        <div className="mt-3 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold leading-snug" style={{ color: '#2A2420' }}>
              {listing.title}
            </h3>
            {listing.rating != null && (
              <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium" style={{ color: '#6B5F58' }}>
                <StarIcon className="h-3 w-3 text-amber-400" />
                {listing.rating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="truncate text-xs" style={{ color: '#A89E97' }}>{listing.address}</p>

          <p className="pt-1">
            <span
              className="text-sm font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#C17A54' }}
            >
              {currencyFormatter.format(price)}
            </span>
            <span className="text-xs font-normal" style={{ color: '#A89E97' }}> / night</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
