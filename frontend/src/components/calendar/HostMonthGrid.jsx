const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function GuestAvatar({ name }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold text-white">
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

// status/source tra ve tu API that (calendar.service.js backend):
// - status 'booked'  + source 'booking'   -> booking that qua REQ_07 (co ten khach)
// - status 'blocked' + source 'ical_sync' -> bi chiem boi lich ngoai (Airbnb/VRBO), CHI DOC,
//   khong cho click sua vi nguon su that la lich ngoai, sync lai se ghi de
// - status 'blocked' + source 'manual'    -> host tu chan tay, click duoc de mo lai
// - status 'available'                    -> con trong, click duoc de chan
export default function HostMonthGrid({ year, month, days, todayYMD, onDayClick }) {
  const cells = buildMonthGrid(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-neutral-200 pb-2 text-center text-xs font-medium text-neutral-500">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((dayNum, i) => {
          if (!dayNum) return <div key={`empty-${i}`} />;

          const info = days[dayNum - 1];
          const isPast = info.date < todayYMD;
          const isSynced = info.source === 'ical_sync';
          const clickable = !isPast && info.status !== 'booked' && !isSynced;

          return (
            <button
              key={info.date}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onDayClick(info)}
              title={info.guestLabel || info.note || undefined}
              className={`flex h-24 flex-col overflow-hidden rounded-lg border text-left transition-colors ${
                info.status === 'booked'
                  ? `border-brand-700 bg-brand-600 cursor-default ${isPast ? 'opacity-60' : ''}`
                  : isSynced
                    ? `border-indigo-600 bg-indigo-500 cursor-default ${isPast ? 'opacity-60' : ''}`
                    : info.status === 'blocked'
                      ? `border-neutral-300 bg-neutral-100 ${isPast ? 'opacity-60' : 'hover:border-neutral-400'}`
                      : isPast
                        ? 'border-neutral-100 bg-neutral-50 cursor-default'
                        : 'border-neutral-200 bg-white hover:border-brand-400'
              } ${info.date === todayYMD ? 'ring-2 ring-brand-500' : ''}`}
            >
              <span
                className={`px-2 pt-1.5 text-xs font-semibold ${
                  info.status === 'booked' || isSynced ? 'text-white' : isPast ? 'text-neutral-300' : 'text-neutral-700'
                }`}
              >
                {dayNum}
              </span>

              <span className="mt-auto flex flex-col gap-0.5 px-2 pb-1.5">
                {info.status === 'booked' ? (
                  <span className="flex items-center gap-1 truncate">
                    <GuestAvatar name={info.guestLabel} />
                    <span className="truncate text-[11px] font-medium text-white">{info.guestLabel}</span>
                  </span>
                ) : isSynced ? (
                  <span className="truncate text-[11px] font-medium text-white">{info.guestLabel}</span>
                ) : info.status === 'blocked' ? (
                  <span className="text-[11px] font-semibold text-neutral-500">Đã chặn</span>
                ) : !isPast ? (
                  <>
                    <span className={`text-[11px] font-medium ${info.hasOverride ? 'text-brand-700' : 'text-neutral-600'}`}>
                      {currencyFormatter.format(info.price)}
                    </span>
                    {(info.minNights || info.maxNights) && (
                      <span className="text-[9px] text-neutral-400">
                        {info.minNights ? `Tối thiểu ${info.minNights} đêm` : ''}
                        {info.minNights && info.maxNights ? ' · ' : ''}
                        {info.maxNights ? `Tối đa ${info.maxNights} đêm` : ''}
                      </span>
                    )}
                  </>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
