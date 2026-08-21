import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon, StarIcon } from '../common/icons';
import { formatPrice } from '../../utils/currency';

export default function ListingCard({ listing }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  return (
    <article className="group">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
          <img
            src={listing.thumbnail || listing.image}
            alt={t('listing.imageAltIn', { title: listing.title, address: listing.address })}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSaved((s) => !s);
            }}
            aria-pressed={saved}
            aria-label={saved ? t('listing.unsave') : t('listing.save')}
            className="absolute right-3 top-3"
          >
            <HeartIcon filled={saved} className="h-6 w-6 text-brand-600 drop-shadow" />
          </button>
        </div>

        <div className="mt-2 flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-medium text-neutral-900">{listing.address}</h3>
          {listing.rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-sm text-neutral-900">
              <StarIcon className="h-3.5 w-3.5" />
              {listing.rating.toFixed(2)}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-neutral-500">{listing.title}</p>
        <p className="mt-1 text-sm text-neutral-900">
          {listing.weekdayPrice !== listing.weekendPrice && (
            <span className="text-neutral-500">{t('listing.priceFrom')} </span>
          )}
          <span className="font-semibold">{formatPrice(listing.pricePerNight)}</span>{' '}
          {t('listing.perNight')}
        </p>
      </Link>
    </article>
  );
}
