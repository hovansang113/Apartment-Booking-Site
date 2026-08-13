import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoLightbox from './PhotoLightbox';

export default function Gallery({ images, title }) {
  const { t } = useTranslation();
  const [cover, ...rest] = images;
  const thumbs = rest.slice(0, 4);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <>
      <div className="relative grid grid-cols-1 gap-2 overflow-hidden rounded-xl sm:grid-cols-4 sm:grid-rows-2 sm:gap-2">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="sm:col-span-2 sm:row-span-2"
        >
          <img
            src={cover}
            alt={title}
            className="h-64 w-full object-cover sm:h-full"
            loading="eager"
          />
        </button>
        {thumbs.map((src, i) => (
          <button
            type="button"
            key={src + i}
            onClick={() => setLightboxIndex(i + 1)}
            className="hidden sm:block"
          >
            <img
              src={src}
              alt={t('listing.photoAlt', { title, index: i + 2 })}
              className="h-full max-h-[196px] w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="absolute bottom-4 right-4 hidden rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-neutral-50 sm:block"
        >
          {t('listing.seeAllPhotos')}
        </button>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          images={images}
          index={lightboxIndex}
          title={title}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
        />
      )}
    </>
  );
}
