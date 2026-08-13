const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const COLS = 7;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

// Tra ve mang cac TUAN, moi tuan la 1 mang 7 o (null = truoc ngay 1 / sau
// ngay cuoi thang). Xu ly theo tung tuan rieng bao gio cung don gian va chac
// chan hon 1 grid lien tuc 42 o - moi tuan la 1 grid doc lap, thanh bar cua
// tuan nao chi can khop dung cot trong pham vi grid cua tuan do.
function buildWeeks(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const flat = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) flat.push(d);
  while (flat.length % COLS !== 0) flat.push(null);

  const weeks = [];
  for (let i = 0; i < flat.length; i += COLS) weeks.push(flat.slice(i, i + COLS));
  return weeks;
}

// Gop cac ngay lien tiep co cung trang thai/nguon/nguoi vao 1 khoang, de ve
// thanh (bar) keo dai qua nhieu o thay vi lap lai chu trong tung o rieng le
// (khop kieu hien thi trong ticket cua Jason - "Bianca + 2" keo dai qua nhieu
// ngay thay vi tung o rieng).
function groupOccupiedRanges(days) {
  const ranges = [];
  let current = null;

  days.forEach((d, i) => {
    const dayNum = i + 1;
    const isBar = d.status === 'booked' || d.status === 'blocked';
    const key = isBar ? `${d.status}|${d.source}|${d.guestLabel}|${d.note}` : null;

    if (current && key && current.key === key) {
      current.endDayExclusive = dayNum + 1;
    } else {
      if (current) ranges.push(current);
      current = isBar
        ? { key, startDay: dayNum, endDayExclusive: dayNum + 1, status: d.status, source: d.source, guestLabel: d.guestLabel, note: d.note, date: d.date }
        : null;
    }
  });
  if (current) ranges.push(current);
  return ranges;
}

// Voi 1 tuan cu the (mang 7 o ngay), tra ve doan (segment) cua 1 khoang ngay
// roi vao tuan do - null neu khoang do khong cham tuan nay.
function segmentForWeek(range, week) {
  let col = null;
  let span = 0;
  let firstDay = null;
  let lastDay = null;

  for (let c = 0; c < COLS; c++) {
    const dayNum = week[c];
    const inRange = dayNum && dayNum >= range.startDay && dayNum < range.endDayExclusive;
    if (inRange) {
      if (col === null) col = c;
      span += 1;
      if (firstDay === null) firstDay = dayNum;
      lastDay = dayNum;
    }
  }
  if (col === null) return null;

  return {
    col,
    span,
    roundedLeft: firstDay === range.startDay,
    roundedRight: lastDay === range.endDayExclusive - 1,
  };
}

function GuestAvatar({ name }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold text-white">
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

function barColorClasses(range) {
  if (range.status === 'booked') return 'bg-brand-600';
  if (range.source === 'ical_sync') return 'bg-indigo-500';
  return 'bg-neutral-500'; // blocked + manual
}

function WeekRow({ week, days, todayYMD, onDayClick, ranges }) {
  const segmentsWithRange = ranges
    .map((range) => ({ range, seg: segmentForWeek(range, week) }))
    .filter((r) => r.seg);

  return (
    <div className="relative">
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((dayNum, i) => {
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
                isPast ? 'border-neutral-100 bg-neutral-50' : `border-neutral-200 bg-white ${clickable ? 'hover:border-brand-400' : ''}`
              } ${info.date === todayYMD ? 'ring-2 ring-brand-500' : ''}`}
            >
              <span className={`px-2 pt-1.5 text-xs font-semibold ${isPast ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {dayNum}
              </span>

              {info.status === 'available' && !isPast && (
                <span className="mt-auto flex flex-col gap-0.5 px-2 pb-1.5">
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
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overlay cung cau truc grid-cols-7 gap-1.5, tram khop dung cot voi grid
          o ngay ben tren vi cung 1 cong thuc chia cot - khong dinh cham vao
          click, chi la lop hien thi. */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-7 gap-1.5">
        {segmentsWithRange.map(({ range, seg }, i) => {
          const isPast = range.date < todayYMD;
          const label = range.status === 'blocked' && range.source === 'manual' ? range.note || 'Đã chặn' : range.guestLabel;

          return (
            <div
              key={i}
              style={{ gridColumn: `${seg.col + 1} / span ${seg.span}` }}
              className={`flex items-end px-0.5 pb-1.5 ${isPast ? 'opacity-60' : ''}`}
            >
              <span
                className={`flex w-full min-w-0 items-center gap-1 overflow-hidden px-2 py-1 text-[11px] font-medium text-white ${barColorClasses(range)} ${
                  seg.roundedLeft ? 'rounded-l-full pl-2' : 'pl-1'
                } ${seg.roundedRight ? 'rounded-r-full pr-2' : 'pr-1'}`}
              >
                {range.status === 'booked' && <GuestAvatar name={range.guestLabel} />}
                <span className="truncate">{label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// status/source tra ve tu API that (calendar.service.js backend):
// - status 'booked'  + source 'booking'   -> booking that qua REQ_07 (co ten khach)
// - status 'blocked' + source 'ical_sync' -> bi chiem boi lich ngoai (Airbnb/VRBO), CHI DOC,
//   khong cho click sua vi nguon su that la lich ngoai, sync lai se ghi de
// - status 'blocked' + source 'manual'    -> host tu chan tay, click duoc de mo lai
// - status 'available'                    -> con trong, click duoc de chan
//
// Ngay bi chiem (booked/blocked) duoc ve thanh 1 THANH keo dai qua nhieu o
// (khop UI tham khao cua Jason) thay vi lap lai nhan trong tung o. Moi tuan
// la 1 cap grid doc lap (o ngay + overlay thanh) de tranh loi can vi khi
// tron item auto-place voi item dat vi tri tuyet doi trong CUNG 1 grid.
export default function HostMonthGrid({ year, month, days, todayYMD, onDayClick }) {
  const weeks = buildWeeks(year, month);
  const ranges = groupOccupiedRanges(days);

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-neutral-200 pb-2 text-center text-xs font-medium text-neutral-500">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-2 space-y-1.5">
        {weeks.map((week, i) => (
          <WeekRow key={i} week={week} days={days} todayYMD={todayYMD} onDayClick={onDayClick} ranges={ranges} />
        ))}
      </div>
    </div>
  );
}
