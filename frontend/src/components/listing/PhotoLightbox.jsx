import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '../common/icons';

export default function PhotoLightbox({ images, index, title, onClose, onPrev, onNext }) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-sm font-medium text-white">
          {t('listing.lightbox.counter', { current: index + 1, total: images.length })}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            type="button"
            onClick={onPrev}
            aria-label={t('listing.lightbox.prev')}
            className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 hover:bg-white sm:left-6"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}

        <img
          src={images[index]}
          alt={t('listing.photoAlt', { title, index: index + 1 })}
          className="max-h-full max-w-full object-contain"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            aria-label={t('listing.lightbox.next')}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 hover:bg-white sm:right-6"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
