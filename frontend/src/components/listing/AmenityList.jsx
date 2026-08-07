import { AmenityIcon } from '../common/icons';

// Khop voi enum Amenity trong backend/prisma/schema.prisma
export const AMENITY_LABELS = {
  wifi: 'Wifi',
  kitchen: 'Bếp',
  washer: 'Máy giặt',
  air_conditioning: 'Điều hòa',
  free_parking: 'Chỗ đậu xe miễn phí',
  pool: 'Hồ bơi',
  tv: 'TV',
  workspace: 'Góc làm việc',
};

export default function AmenityList({ amenities }) {
  if (!amenities?.length) return null;

  return (
    <section aria-labelledby="amenities-heading" className="border-t border-neutral-200 py-8">
      <h2 id="amenities-heading" className="text-xl font-semibold text-neutral-900">
        Tiện nghi
      </h2>
      <ul className="mt-6 grid list-none grid-cols-1 gap-4 sm:grid-cols-2">
        {amenities.map((amenity) => (
          <li key={amenity} className="flex items-center gap-4 text-neutral-700">
            <AmenityIcon name={amenity} className="h-6 w-6 shrink-0" />
            <span>{AMENITY_LABELS[amenity] || amenity}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
