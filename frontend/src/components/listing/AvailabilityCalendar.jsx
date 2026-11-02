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

function MonthCalendar({ year, month, bookedSet, todayYMD, checkIn, checkOut, stayRules, minNights, maxNights, onSelectDate, weekdays, dateFnsLocale, t }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const validCheckoutRange = useMemo(() => {
    if (!checkIn || checkOut) return null;
    const rule = stayRules?.[checkIn];
    const effectiveMin = rule?.minNights ?? minNights;
    const effectiveMax = rule?.maxNights ?? maxNights;
    if (!effectiveMin && !effectiveMax) return null;
    const base = new Date(checkIn);
    return {
      earliest: effectiveMin ? toYMD(new Date(base.getTime() + effectiveMin * 86400000)) : null,
      latest: effectiveMax ? toYMD(new Date(base.getTime() + effectiveMax * 86400000)) : null,
      minNights: effectiveMin,
      maxNights: effectiveMax,
    };
  }, [checkIn, checkOut, stayRules, minNights, maxNights]);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center font-semibold text-neutral-800 mb-3 capitalize">
        {format(new Date(year, month, 1), 'LLLL yyyy', { locale: dateFnsLocale })}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-neutral-400 py-1">
            {d}
          </div>
        ))}
      </div>
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

          // Ngày vi phạm min/max nights khi đang chọn checkout
          const isOutOfStayRange =
            checkIn && !checkOut && ymd > checkIn && validCheckoutRange &&
            ((validCheckoutRange.earliest && ymd < validCheckoutRange.earliest) ||
             (validCheckoutRange.latest && ymd > validCheckoutRange.latest));

          const isDisabled = isPast || isBooked || isOutOfStayRange;

          let className = 'flex items-center justify-center h-9 w-full rounded-full text-sm transition-colors ';

          if (isCheckIn || isCheckOut) {
            className += 'bg-teal-600 text-white font-semibold shadow cursor-pointer';
          } else if (isInRange) {
            className += 'bg-teal-100 text-teal-800 font-medium cursor-pointer';
          } else if (isPast) {
            className += 'text-neutral-300 cursor-default';
          } else if (isBooked) {
            className += 'bg-red-50 text-red-400 cursor-not-allowed relative overflow-hidden';
          } else if (isOutOfStayRange) {
            className += 'text-neutral-300 cursor-not-allowed';
          } else {
            className += 'text-neutral-800 hover:bg-teal-50 cursor-pointer';
          }

          if (isToday && !isPast && !isCheckIn && !isCheckOut) {
            className += ' ring-2 ring-teal-500 font-semibold';
          }

          let title = '';
          if (isBooked) title = t('listing.calendar.bookedTitle');
          else if (isOutOfStayRange) {
            if (validCheckoutRange?.earliest && ymd < validCheckoutRange.earliest)
              title = t('listing.calendar.minNightsHint', { count: validCheckoutRange.minNights });
            else if (validCheckoutRange?.latest && ymd > validCheckoutRange.latest)
              title = t('listing.calendar.maxNightsHint', { count: validCheckoutRange.maxNights });
          } else if (!isPast) {
            title = t('listing.calendar.clickToSelect');
          }

          return (
            <div key={ymd} className="flex justify-center py-0.5">
              <div
                onClick={() => !isDisabled && onSelectDate && onSelectDate(ymd)}
                className={className}
                title={title}
              >
                {isBooked && !isPast ? (
                  <span className="relative">
                    {date.getDate()}
                    <span className="absolute inset-x-0 top-1/2 h-px bg-red-400 block" />
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

export default function AvailabilityCalendar({ bookedRanges = [], stayRules = {}, minNights, maxNights, checkIn, checkOut, onSelectDate }) {
  const { t } = useTranslation();
  const weekdays = t('dateRangePicker.weekdays', { returnObjects: true });
  const dateFnsLocale = enUS;

  const today = new Date();
  const todayYMD = toYMD(today);

  const [offset, setOffset] = useState(0);

  const bookedSet = useMemo(() => buildBookedSet(bookedRanges), [bookedRanges]);

  const activeRule = checkIn ? stayRules[checkIn] : null;

  const month1 = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1);

  const canGoPrev = offset > 0;

  return (
    <section id="availability-calendar" className="py-8 border-t border-neutral-200 scroll-mt-24">
      <h2 className="text-xl font-semibold text-neutral-900 mb-1">{t('listing.calendar.heading')}</h2>
      <p className="text-sm text-neutral-500 mb-5">{t('listing.calendar.hint')}</p>

      {/* Default min/max nights hint */}
      {(minNights || maxNights) && (
        <div className="mb-5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
          {minNights && maxNights
            ? `Minimum ${minNights} nights — Maximum ${maxNights} nights per stay`
            : minNights
            ? `Minimum stay: ${minNights} nights`
            : `Maximum stay: ${maxNights} nights`}
        </div>
      )}

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
          <span className="w-4 h-4 rounded-full bg-red-50 inline-block relative overflow-hidden">
            <span className="absolute inset-x-0 top-1/2 h-px bg-red-400 block" />
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
          stayRules={stayRules}
          minNights={minNights}
          maxNights={maxNights}
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
          stayRules={stayRules}
          minNights={minNights}
          maxNights={maxNights}
          onSelectDate={onSelectDate}
          weekdays={weekdays}
          dateFnsLocale={dateFnsLocale}
          t={t}
        />
      </div>

      {checkIn && !checkOut && (() => {
        const rule = stayRules[checkIn];
        const effectiveMin = rule?.minNights ?? minNights;
        const effectiveMax = rule?.maxNights ?? maxNights;
        if (!effectiveMin && !effectiveMax) return null;
        return (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            {effectiveMin && effectiveMax
              ? t('listing.calendar.stayRuleBoth', { min: effectiveMin, max: effectiveMax })
              : effectiveMin
              ? t('listing.calendar.stayRuleMin', { count: effectiveMin })
              : t('listing.calendar.stayRuleMax', { count: effectiveMax })}
          </div>
        );
      })()}
    </section>
  );
}
