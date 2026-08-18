import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../common/icons';

function formatDayLabel(ymd, locale) {
  return format(parseISO(ymd), 'MMM d', { locale });
}

// Chan/mo khoa NHIEU ngay cung luc + 1 ghi chu chung - pham vi co tinh, KHONG
// dong gia rieng tung ngay (khac DayEditModal 1-ngay, van giu nguyen o do vi
// gia con phan biet ngay thuong/cuoi tuan, ap 1 gia cho ca khoang se lam mat
// phan biet do). dates: mang YMD da sap xep tang dan.
export default function BulkDayEditModal({ dates, onClose, onSave }) {
  const { t } = useTranslation();
  const dateFnsLocale = enUS;
  const [blocked, setBlocked] = useState(true); // vi dung "chon nhieu ngay" thuong de chan (di vang, bao tri)
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const rangeLabel =
    dates.length === 1
      ? formatDayLabel(dates[0], dateFnsLocale)
      : `${formatDayLabel(dates[0], dateFnsLocale)} – ${formatDayLabel(dates[dates.length - 1], dateFnsLocale)}`;

  async function handleSave() {
    setSaving(true);
    await onSave({ dates, status: blocked ? 'blocked' : 'available', note: note.trim() });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white">
            {rangeLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
            aria-label={t('hostCalendar.dayModal.close')}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          {t('hostCalendar.bulkModal.daysCount', { count: dates.length })}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <span className={`h-2 w-2 rounded-full ${blocked ? 'bg-neutral-400' : 'bg-emerald-400'}`} />
            {blocked ? t('hostCalendar.dayModal.blocked') : t('hostCalendar.dayModal.available')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!blocked}
            onClick={() => setBlocked((b) => !b)}
            className={`relative h-6 w-11 rounded-full transition-colors ${blocked ? 'bg-neutral-600' : 'bg-white'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
                blocked ? 'left-0.5 bg-white' : 'left-[22px] bg-neutral-900'
              }`}
            />
          </button>
        </div>

        {blocked && (
          <div className="mt-2.5 rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
            <p className="text-xs text-neutral-400">{t('hostCalendar.dayModal.noteLabel')}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={t('hostCalendar.dayModal.notePlaceholder')}
              className="mt-1 w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
          </div>
        )}

        <p className="mt-3 text-xs text-neutral-400">{t('hostCalendar.bulkModal.priceHint')}</p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? t('hostCalendar.dayModal.saving') : t('hostCalendar.dayModal.save')}
        </button>
      </div>
    </div>
  );
}
