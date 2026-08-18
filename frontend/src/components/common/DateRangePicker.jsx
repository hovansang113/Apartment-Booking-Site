import { useMemo, useState } from 'react';
import {
  addMonths,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const FLEX_KEYS = [1, 2, 3, 7, 14];

// Luoi thang, bat dau tu Thu Hai. Cell rong (null) cho cac o truoc ngay 1.
function buildMonthGrid(monthStart) {
  const firstWeekday = (monthStart.getDay() + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const cells = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
  }
  return cells;
}

function Month({ monthStart, range, hoverDay, onHover, onPick, minDate, weekdays, dateFnsLocale }) {
  const cells = useMemo(() => buildMonthGrid(monthStart), [monthStart]);
  const { checkIn, checkOut } = range;
  const previewEnd = checkOut || hoverDay;

  return (
    <div className="w-full">
      <p className="mb-4 text-center text-sm font-semibold text-neutral-900">
        {format(monthStart, 'LLLL yyyy', { locale: dateFnsLocale })}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-medium text-neutral-500">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;

          const disabled = isBefore(day, minDate);
          const isStart = checkIn && isSameDay(day, checkIn);
          const isEnd = checkOut && isSameDay(day, checkOut);
          const inRange =
            checkIn &&
            previewEnd &&
            !isBefore(previewEnd, checkIn) &&
            isWithinInterval(day, { start: checkIn, end: previewEnd });

          return (
            <div key={day.toISOString()} className="relative py-0.5">
              {(inRange || isStart || isEnd) && (
                <span
                  className={`absolute inset-y-0.5 ${isStart ? 'left-1/2' : 'left-0'} ${
                    isEnd ? 'right-1/2' : 'right-0'
                  } bg-brand-50`}
                />
              )}
              <button
                type="button"
                disabled={disabled}
                onMouseEnter={() => onHover(day)}
                onClick={() => onPick(day)}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  disabled
                    ? 'cursor-not-allowed text-neutral-300'
                    : isStart || isEnd
                      ? 'bg-brand-600 font-semibold text-white'
                      : 'text-neutral-800 hover:border hover:border-neutral-900'
                }`}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({ value, onChange, onClose }) {
  const { t } = useTranslation();
  const weekdays = t('dateRangePicker.weekdays', { returnObjects: true });
  const dateFnsLocale = enUS;
  const flexOptions = [
    { key: 'exact', label: t('dateRangePicker.exactDay') },
    ...FLEX_KEYS.map((n) => ({ key: n, label: t('dateRangePicker.flexDays', { count: n }) })),
  ];

  const today = startOfDay(new Date());
  const [tab, setTab] = useState('exact-mode'); // 'exact-mode' | 'flexible-mode'
  const [flex, setFlex] = useState('exact');
  const [leftMonth, setLeftMonth] = useState(startOfMonth(value.checkIn || today));
  const [hoverDay, setHoverDay] = useState(null);

  const rightMonth = addMonths(leftMonth, 1);
  const atEarliestMonth = isSameMonth(leftMonth, today) || isBefore(leftMonth, today);

  function handlePick(day) {
    const { checkIn, checkOut } = value;
    if (!checkIn || checkOut) {
      onChange({ checkIn: day, checkOut: null });
      return;
    }
    if (isBefore(day, checkIn)) {
      onChange({ checkIn: day, checkOut: null });
      return;
    }
    onChange({ checkIn, checkOut: day });
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl">
      <div className="mb-5 flex justify-center">
        <div className="inline-flex rounded-full bg-neutral-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setTab('exact-mode')}
            className={`rounded-full px-5 py-2 transition-colors ${
              tab === 'exact-mode' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
            }`}
          >
            {t('dateRangePicker.exact')}
          </button>
          <button
            type="button"
            onClick={() => setTab('flexible-mode')}
            className={`rounded-full px-5 py-2 transition-colors ${
              tab === 'flexible-mode' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
            }`}
          >
            {t('dateRangePicker.flexible')}
          </button>
        </div>
      </div>

      {tab === 'flexible-mode' ? (
        <p className="px-8 py-16 text-center text-sm text-neutral-500">{t('dateRangePicker.flexibleComingSoon')}</p>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              aria-label={t('dateRangePicker.prevMonth')}
              disabled={atEarliestMonth}
              onClick={() => setLeftMonth((m) => addMonths(m, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-0"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t('dateRangePicker.nextMonth')}
              onClick={() => setLeftMonth((m) => addMonths(m, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-8 sm:grid-cols-2" onMouseLeave={() => setHoverDay(null)}>
            <Month
              monthStart={leftMonth}
              range={value}
              hoverDay={hoverDay}
              onHover={setHoverDay}
              onPick={handlePick}
              minDate={today}
              weekdays={weekdays}
              dateFnsLocale={dateFnsLocale}
            />
            <Month
              monthStart={rightMonth}
              range={value}
              hoverDay={hoverDay}
              onHover={setHoverDay}
              onPick={handlePick}
              minDate={today}
              weekdays={weekdays}
              dateFnsLocale={dateFnsLocale}
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-neutral-200 pt-5">
            {flexOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFlex(opt.key)}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  flex === opt.key
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
        <button
          type="button"
          onClick={() => onChange({ checkIn: null, checkOut: null })}
          className="text-sm font-semibold text-neutral-900 underline hover:text-brand-700"
        >
          {t('dateRangePicker.clear')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t('dateRangePicker.close')}
        </button>
      </div>
    </div>
  );
}
