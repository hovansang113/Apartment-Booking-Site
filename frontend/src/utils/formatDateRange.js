import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

const LOCALES = { vi, en: enUS };

export function formatDateRange({ checkIn, checkOut }, lang = 'vi') {
  const locale = LOCALES[lang] || vi;
  if (!checkIn) return null;
  if (!checkOut) return format(checkIn, 'd MMM', { locale });
  return `${format(checkIn, 'd MMM', { locale })} - ${format(checkOut, 'd MMM', { locale })}`;
}
