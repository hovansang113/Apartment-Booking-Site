import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function formatDateRange({ checkIn, checkOut }) {
  if (!checkIn) return null;
  if (!checkOut) return format(checkIn, 'd MMM', { locale: vi });
  return `${format(checkIn, 'd MMM', { locale: vi })} - ${format(checkOut, 'd MMM', { locale: vi })}`;
}
