import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../common/icons';

const DATE_FNS_LOCALES = { vi, en: enUS };

function formatDayLabel(ymd, locale) {
  return format(parseISO(ymd), 'MMM d', { locale });
}

// Cuoi tuan = dem Thu 6 + Thu 7, khop dung logic phia backend
// (utils/pricing.util.js) de nhan dung ten gia goc dang hien thi.
function isWeekendDate(ymd) {
  const dow = parseISO(ymd).getDay();
  return dow === 5 || dow === 6;
}

// REQ_12: sua trang thai 1 ngay (available/blocked) + gia rieng cho ngay do +
// ghi chu + "Custom settings" (so dem toi thieu/toi da neu check-in ngay nay).
// onSave goi calendarService that (block/unblock + price + stay-rule).
// basePrice: gia goc (ngay thuong/cuoi tuan, REQ_13) CUA DUNG NGAY dang sua -
// dung de so sanh/hien strikethrough khi host ghi de gia rieng ngay nay.
export default function DayEditModal({ day, basePrice, onClose, onSave }) {
  const { t, i18n } = useTranslation();
  const dateFnsLocale = DATE_FNS_LOCALES[i18n.language] || vi;
  const [blocked, setBlocked] = useState(day.status === 'blocked');
  const [price, setPrice] = useState(day.price);
  const [note, setNote] = useState(day.note || '');
  const [showCustomSettings, setShowCustomSettings] = useState(Boolean(day.minNights || day.maxNights));
  const [minNights, setMinNights] = useState(day.minNights || '');
  const [maxNights, setMaxNights] = useState(day.maxNights || '');

  function handleSave() {
    onSave({
      date: day.date,
      status: blocked ? 'blocked' : 'available',
      price,
      note: note.trim(),
      minNights: showCustomSettings && minNights ? Number(minNights) : null,
      maxNights: showCustomSettings && maxNights ? Number(maxNights) : null,
    });
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
            {formatDayLabel(day.date, dateFnsLocale)}
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

        <div className="mt-2.5 rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
          <p className="text-xs text-neutral-400">
            {t('hostCalendar.dayModal.priceLabel')}{' '}
            {isWeekendDate(day.date) ? t('hostCalendar.dayModal.weekendPriceTag') : t('hostCalendar.dayModal.weekdayPriceTag')}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <input
              type="number"
              min={0}
              step={10000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-28 border-b border-white/30 bg-transparent text-2xl font-bold outline-none focus:border-white"
            />
            {price !== basePrice && (
              <span className="text-sm text-neutral-400 line-through">
                {new Intl.NumberFormat('vi-VN').format(basePrice)}
              </span>
            )}
          </div>
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

        {!blocked && (
          <div className="mt-2.5 rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
            <button
              type="button"
              onClick={() => setShowCustomSettings((s) => !s)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              {t('hostCalendar.dayModal.otherSettings')}
              <span className={`transition-transform ${showCustomSettings ? 'rotate-45' : ''}`}>+</span>
            </button>

            {showCustomSettings && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">{t('hostCalendar.dayModal.minNights')}</label>
                  <input
                    type="number"
                    min={1}
                    value={minNights}
                    onChange={(e) => setMinNights(e.target.value)}
                    placeholder={t('hostCalendar.dayModal.noLimit')}
                    className="mt-1 w-full border-b border-white/30 bg-transparent text-sm outline-none focus:border-white placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">{t('hostCalendar.dayModal.maxNights')}</label>
                  <input
                    type="number"
                    min={1}
                    value={maxNights}
                    onChange={(e) => setMaxNights(e.target.value)}
                    placeholder={t('hostCalendar.dayModal.noLimit')}
                    className="mt-1 w-full border-b border-white/30 bg-transparent text-sm outline-none focus:border-white placeholder:text-neutral-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          {t('hostCalendar.dayModal.save')}
        </button>
      </div>
    </div>
  );
}
