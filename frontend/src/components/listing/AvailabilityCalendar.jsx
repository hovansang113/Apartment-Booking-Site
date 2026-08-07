import { useState, useMemo } from 'react';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

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
  // month: 0-indexed
  const firstDay = new Date(year, month, 1);
  // Monday-first: getDay() 0=Sun -> shift to Mon-first
  let startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];
  // padding before
  for (let i = 0; i < startOffset; i++) days.push(null);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

function MonthCalendar({ year, month, bookedSet, todayYMD }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center font-semibold text-neutral-800 mb-3">
        {MONTHS_VI[month]} {year}
      </p>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
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

          let className = 'flex items-center justify-center h-9 w-full rounded-full text-sm transition-colors ';

          if (isPast) {
            className += 'text-neutral-300 cursor-default';
          } else if (isBooked) {
            className += 'bg-neutral-100 text-neutral-400 cursor-not-allowed relative overflow-hidden';
          } else {
            className += 'text-neutral-800 hover:bg-teal-50 cursor-pointer';
          }

          if (isToday && !isPast) {
            className += ' ring-2 ring-teal-500 font-semibold';
          }

          return (
            <div key={ymd} className="flex justify-center py-0.5">
              <div className={className} title={isBooked ? 'Đã có khách đặt' : isPast ? '' : 'Còn trống'}>
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

export default function AvailabilityCalendar({ bookedRanges = [] }) {
  const today = new Date();
  const todayYMD = toYMD(today);

  const [offset, setOffset] = useState(0); // months offset from current

  const bookedSet = useMemo(() => buildBookedSet(bookedRanges), [bookedRanges]);

  const month1 = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1);

  const canGoPrev = offset > 0;

  return (
    <section className="py-8 border-t border-neutral-200">
      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Lịch trống phòng</h2>
      <p className="text-sm text-neutral-500 mb-5">Thời gian tối thiểu đặt phòng là 1 đêm.</p>

      {/* Legend */}
      <div className="flex gap-5 mb-6 text-xs text-neutral-600">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full border border-neutral-200 bg-white inline-block" />
          Còn trống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-neutral-100 inline-block relative overflow-hidden">
            <span className="absolute inset-x-0 top-1/2 h-px bg-neutral-400 block" />
          </span>
          Đã có khách
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full ring-2 ring-teal-500 inline-block" />
          Hôm nay
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setOffset((o) => o - 1)}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-default transition-colors"
          aria-label="Tháng trước"
        >
          ‹
        </button>
        <button
          onClick={() => setOffset((o) => o + 1)}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Tháng sau"
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
        />
        <div className="w-px bg-neutral-200 shrink-0" />
        <MonthCalendar
          year={month2.getFullYear()}
          month={month2.getMonth()}
          bookedSet={bookedSet}
          todayYMD={todayYMD}
        />
      </div>
    </section>
  );
}
