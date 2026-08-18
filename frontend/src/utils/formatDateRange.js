import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function formatDateRange({ checkIn, checkOut }) {
  if (!checkIn) return null;
  if (!checkOut) return format(checkIn, 'd MMM', { locale: enUS });
  return `${format(checkIn, 'd MMM', { locale: enUS })} - ${format(checkOut, 'd MMM', { locale: enUS })}`;
}
