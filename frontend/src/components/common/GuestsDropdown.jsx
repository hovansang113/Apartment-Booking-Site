import { useTranslation } from 'react-i18next';
import { MinusIcon, PlusIcon } from './icons';

const MIN_GUESTS = 1;
const DEFAULT_MAX_GUESTS = 16;

export default function GuestsDropdown({ value, onChange, max = DEFAULT_MAX_GUESTS }) {
  const { t } = useTranslation();
  const guests = value || MIN_GUESTS;

  return (
    <div className="w-72 rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{t('guestsDropdown.title')}</p>
          <p className="text-sm text-neutral-500">{t('guestsDropdown.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={t('guestsDropdown.decrease')}
            disabled={guests <= MIN_GUESTS}
            onClick={() => onChange(guests - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:border-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-sm font-medium text-neutral-900">{guests}</span>
          <button
            type="button"
            aria-label={t('guestsDropdown.increase')}
            disabled={guests >= max}
            onClick={() => onChange(guests + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:border-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {value > 0 && (
        <div className="mt-4 border-t border-neutral-200 pt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900"
          >
            {t('guestsDropdown.clear')}
          </button>
        </div>
      )}
    </div>
  );
}
