import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

function buildBookedSet(bookedRanges) {
  const set = new Set();
  for (const { start, end } of bookedRanges) {
    const cur = new Date(start);
    const endDate = new Date(end);
    while (cur < endDate) {
      set.add(toYMD(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return set;
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  let startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

function MonthCalendar({ year, month, bookedSet, todayYMD, checkIn, checkOut, onSelectDate, weekdays, dateFnsLocale, t }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center font-semibold text-neutral-800 mb-3 capitalize">
        {format(new Date(year, month, 1), 'LLLL yyyy', { locale: dateFnsLocale })}
      </p>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-neutral-400 py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const ymd = toYMD(date);
          const isToday = ymd === todayYMD;
          const isPast = ymd < todayYMD;
          const isBooked = bookedSet.has(ymd);

          const isCheckIn = ymd === checkIn;
          const isCheckOut = ymd === checkOut;
          const isInRange = checkIn && checkOut && ymd > checkIn && ymd < checkOut;

          let className = 'flex items-center justify-center h-9 w-full rounded-full text-sm transition-colors ';

          if (isCheckIn || isCheckOut) {
            className += 'bg-teal-600 text-white font-semibold shadow cursor-pointer';
          } else if (isInRange) {
            className += 'bg-teal-100 text-teal-800 font-medium cursor-pointer';
          } else if (isPast) {
            className += 'text-neutral-300 cursor-default';
          } else if (isBooked) {
            className += 'bg-neutral-100 text-neutral-400 cursor-not-allowed relative overflow-hidden';
          } else {
            className += 'text-neutral-800 hover:bg-teal-50 cursor-pointer';
          }

          if (isToday && !isPast && !isCheckIn && !isCheckOut) {
            className += ' ring-2 ring-teal-500 font-semibold';
          }

          return (
            <div key={ymd} className="flex justify-center py-0.5">
              <div
                onClick={() => !isPast && !isBooked && onSelectDate && onSelectDate(ymd)}
                className={className}
                title={isBooked ? t('listing.calendar.bookedTitle') : isPast ? '' : t('listing.calendar.clickToSelect')}
              >
                {isBooked && !isPast ? (
                  <span className="relative">
                    {date.getDate()}
                    <span className="absolute inset-x-0 top-1/2 h-px bg-neutral-400 block" />
                  </span>
                ) : (
                  date.getDate()
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({ bookedRanges = [], checkIn, checkOut, onSelectDate }) {
  const { t } = useTranslation();
  const weekdays = t('dateRangePicker.weekdays', { returnObjects: true });
  const dateFnsLocale = enUS;

  const today = new Date();
  const todayYMD = toYMD(today);

  const [offset, setOffset] = useState(0);

  const bookedSet = useMemo(() => buildBookedSet(bookedRanges), [bookedRanges]);

  const month1 = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1);

  const canGoPrev = offset > 0;

  return (
    <section id="availability-calendar" className="py-8 border-t border-neutral-200 scroll-mt-24">
      <h2 className="text-xl font-semibold text-neutral-900 mb-1">{t('listing.calendar.heading')}</h2>
      <p className="text-sm text-neutral-500 mb-5">{t('listing.calendar.hint')}</p>

      {/* Legend */}
      <div className="flex gap-5 mb-6 text-xs text-neutral-600">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full border border-neutral-200 bg-white inline-block" />
          {t('listing.calendar.available')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-teal-600 inline-block" />
          {t('listing.calendar.selected')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-neutral-100 inline-block relative overflow-hidden">
            <span className="absolute inset-x-0 top-1/2 h-px bg-neutral-400 block" />
          </span>
          {t('listing.calendar.booked')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full ring-2 ring-teal-500 inline-block" />
          {t('listing.calendar.today')}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setOffset((o) => o - 1)}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-default transition-colors"
          aria-label={t('listing.calendar.prevMonth')}
        >
          ‹
        </button>
        <button
          onClick={() => setOffset((o) => o + 1)}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label={t('listing.calendar.nextMonth')}
        >
          ›
        </button>
      </div>

      {/* 2 months side by side */}
      <div className="flex gap-8">
        <MonthCalendar
          year={month1.getFullYear()}
          month={month1.getMonth()}
          bookedSet={bookedSet}
          todayYMD={todayYMD}
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectDate={onSelectDate}
          weekdays={weekdays}
          dateFnsLocale={dateFnsLocale}
          t={t}
        />
        <div className="w-px bg-neutral-200 shrink-0" />
        <MonthCalendar
          year={month2.getFullYear()}
          month={month2.getMonth()}
          bookedSet={bookedSet}
          todayYMD={todayYMD}
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectDate={onSelectDate}
          weekdays={weekdays}
          dateFnsLocale={dateFnsLocale}
          t={t}
        />
      </div>
    </section>
  );
}
