import { useTranslation } from 'react-i18next';
import { AmenityIcon } from '../common/icons';

export default function AmenityList({ amenities }) {
  const { t } = useTranslation();
  if (!amenities?.length) return null;

  return (
    <section aria-labelledby="amenities-heading" className="border-t border-neutral-200 py-8">
      <h2 id="amenities-heading" className="text-xl font-semibold text-neutral-900">
        {t('listing.amenitiesHeading')}
      </h2>
      <ul className="mt-6 grid list-none grid-cols-1 gap-4 sm:grid-cols-2">
        {amenities.map((amenity) => (
          <li key={amenity} className="flex items-center gap-4 text-neutral-700">
            <AmenityIcon name={amenity} className="h-6 w-6 shrink-0" />
            <span>{t(`listing.amenities.${amenity}`, { defaultValue: amenity })}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
