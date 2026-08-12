import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../../services/adminService';
import { Link } from 'react-router-dom';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';

const PERIODS = [
  { value: 'week',    label: 'Week'    },
  { value: 'month',   label: 'Month'   },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year',    label: 'Year'    },
];

const PERIOD_LABELS = {
  week: 'this week vs last week',
  month: 'this month vs last month',
  quarter: 'this quarter vs last quarter',
  year: 'this year vs last year',
};

const vnd = (n) => Number(n).toLocaleString('vi-VN') + '₫';
const fmt = (d) => new Date(d).toLocaleDateString('en-GB');

const STATUS = {
  approved: { dot: '#2F4A3E', label: 'Confirmed',  text: '#2F4A3E' },
  pending:  { dot: '#A89E97', label: 'Pending',     text: '#A89E97' },
  canceled: { dot: '#B85C38', label: 'Cancelled',   text: '#B85C38' },
  rejected: { dot: '#B85C38', label: 'Rejected',    text: '#B85C38' },
};

function SectionNum({ n, label }) {
  return (
    <div className="flex items-baseline gap-2 mb-5">
      <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 10, color: '#DDD4C4' }}>{n}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A89E97]">{label}</span>
    </div>
  );
}

function Avatar({ name = '' }) {
  const parts = name.trim().split(' ');
  const init = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return (
    <div
      className="w-8 h-8 shrink-0 flex items-center justify-center text-white text-[11px] font-bold"
      style={{ backgroundColor: '#2F4A3E', borderRadius: 3, fontFamily: 'Fraunces, Georgia, serif' }}
    >
      {init}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { dot: '#aaa', label: status, text: '#aaa' };
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: s.text }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.dot, display: 'inline-block', flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function Icon({ path, size = 18, opacity = 0.45 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#2F4A3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ opacity }}>
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  revenue: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v2m0 8v2M9.5 10A2.5 2.5 0 0 1 12 8a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-1.5',
  booking: 'M3 4h18v18H3V4zm5-2v4m8-4v4M3 10h18M10 16l2 2 4-4',
  listing: 'M3 21V10l9-7 9 7v11M9 21v-6h6v6',
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0m8 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#2F4A3E', borderRadius: 4, padding: '4px 8px' }}>
      <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 12, color: '#FAF6EF', margin: 0 }}>
        {vnd(payload[0].value)}
      </p>
      <p style={{ fontSize: 10, color: 'rgba(250,246,239,0.6)', margin: 0 }}>{label}</p>
    </div>
  );
}

function RuledLine({ dashed = false }) {
  return <div style={{ height: 1, borderTop: dashed ? '1px dashed #DDD4C4' : '1px solid #EDE8E1', margin: '8px 0' }} />;
}

function SmallCard({ label, value, iconPath, sub, subColor, valueColor = '#2F4A3E' }) {
  return (
    <div className="flex flex-col justify-between p-4" style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF', minHeight: 0 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A89E97] leading-tight">{label}</span>
        <Icon path={iconPath} size={14} opacity={0.35} />
      </div>
      <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 28, color: valueColor, lineHeight: 1, margin: '6px 0' }}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] leading-snug mt-2 pt-2" style={{ borderTop: '1px dashed #DDD4C4', color: subColor ?? '#A89E97' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminStatsPage() {
  const [period, setPeriod] = useState('month');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats', period],
    queryFn: () => getAdminStats(period),
    refetchInterval: 60000,
  });

  if (isLoading) return <p className="py-20 text-center text-sm text-[#A89E97]">Loading...</p>;
  if (!data) return null;

  const { users, listings, bookings, revenue, recentBookings, pendingListings } = data;

  const growthPos = revenue.growthPercent !== null && revenue.growthPercent >= 0;
  const growthLabel = revenue.growthPercent === null ? null
    : growthPos ? `▲ ${revenue.growthPercent}% ${PERIOD_LABELS[period]}`
    : `▼ ${Math.abs(revenue.growthPercent)}% ${PERIOD_LABELS[period]}`;

  return (
    <div className="space-y-10">

      {/* 01 Overview */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <SectionNum n="01" label="Overview" />
          {/* Period selector */}
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className="text-[11px] font-semibold uppercase tracking-[0.09em] px-3 py-1.5 transition-colors"
                style={{
                  borderRadius: 4,
                  border: `1px solid ${period === p.value ? '#2F4A3E' : '#DDD4C4'}`,
                  backgroundColor: period === p.value ? '#2F4A3E' : 'transparent',
                  color: period === p.value ? '#FAF6EF' : '#A89E97',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/* 4 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <SmallCard label="Revenue"  value={vnd(revenue.total)} iconPath={ICONS.revenue}
            sub={growthLabel ?? undefined} subColor={growthPos ? '#2F4A3E' : '#B85C38'} valueColor="#C17A54" />
          <SmallCard label="Bookings" value={bookings.total}     iconPath={ICONS.booking}
            sub={`Cancelled: ${bookings.canceled} · Rejected: ${bookings.rejected ?? 0}`} />
          <SmallCard label="Listings" value={listings.approved}  iconPath={ICONS.listing}
            sub={listings.pending > 0 ? `${listings.pending} pending` : 'None pending'} />
          <SmallCard label="Users"    value={users.total}        iconPath={ICONS.users}
            sub={`${users.hosts} hosts · ${users.total - users.hosts} guests`} />
        </div>

        {/* Revenue chart — full width */}
        <div className="mt-3 p-5" style={{ border: '1.5px solid #A8B5A0', borderRadius: 6, backgroundColor: '#FAF6EF' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A89E97]">Revenue over time</p>
            {growthLabel && (
              <span className="text-[11px] font-medium px-2.5 py-1" style={{
                borderRadius: 4,
                backgroundColor: growthPos ? 'rgba(47,74,62,0.08)' : 'rgba(184,92,56,0.08)',
                color: growthPos ? '#2F4A3E' : '#B85C38',
              }}>
                {growthLabel}
              </span>
            )}
          </div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue.chartData ?? []} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C17A54" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#C17A54" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#A89E97', fontFamily: 'Be Vietnam Pro, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  interval={period === 'month' ? 4 : 0}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#C17A54', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C17A54"
                  strokeWidth={2}
                  fill="url(#rev-fill)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#C17A54', stroke: '#FAF6EF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 02 Pending listings */}
      {pendingListings.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <SectionNum n="02" label="Pending listings" />
            <Link to="/admin/listings" className="text-[11px] font-medium text-[#2F4A3E] hover:underline mb-5">View all →</Link>
          </div>
          <div style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF', overflow: 'hidden' }}>
            {pendingListings.map((l, i) => (
              <div key={l.id} className="flex items-center gap-4 px-5 py-4"
                style={{ borderTop: i > 0 ? '1px dashed #DDD4C4' : 'none' }}>
                {l.image
                  ? <img src={l.image} alt={l.title} className="w-16 h-11 object-cover shrink-0" style={{ borderRadius: 4 }} />
                  : <div className="w-16 h-11 shrink-0" style={{ backgroundColor: '#F0EAE0', borderRadius: 4 }} />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#2A2420] truncate">{l.title}</p>
                  <p className="text-[11px] text-[#A89E97] mt-0.5">{l.hostName} · {fmt(l.createdAt)}</p>
                </div>
                <Link to="/admin/listings"
                  className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-1.5 transition-colors"
                  style={{ border: '1px solid #2F4A3E', color: '#2F4A3E', borderRadius: 4 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2F4A3E'; e.currentTarget.style.color = '#FAF6EF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2F4A3E'; }}
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 02/03 Recent bookings */}
      <section>
        <SectionNum n={pendingListings.length > 0 ? '03' : '02'} label="Recent bookings" />
        {recentBookings.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#A89E97]">No bookings yet</p>
        ) : (
          <div style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF', overflow: 'hidden' }}>
            <div className="grid px-5 py-3" style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.2fr', borderBottom: '1px solid #DDD4C4' }}>
              {['Guest', 'Property', 'Dates', 'Status', 'Total'].map((h) => (
                <span key={h} className="text-[11px] italic text-[#A89E97]">{h}</span>
              ))}
            </div>
            {recentBookings.map((b, i) => (
              <div key={b.id} className="grid items-center px-5 py-3.5"
                style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.2fr', borderTop: i > 0 ? '1px dashed #DDD4C4' : 'none' }}>
                <div className="flex items-center gap-2.5">
                  <Avatar name={b.guestName} />
                  <div>
                    <p className="text-[13px] font-medium text-[#2A2420]">{b.guestName}</p>
                    <p className="text-[10px] text-[#A89E97] mt-0.5">{b.guestEmail}</p>
                  </div>
                </div>
                <p className="text-[12px] text-[#6B5F58] pr-4 line-clamp-2">{b.listingTitle}</p>
                <p className="text-[11px] text-[#A89E97]">{fmt(b.checkIn)}<br />{fmt(b.checkOut)}</p>
                <StatusBadge status={b.status} />
                <p className="text-[14px] font-semibold text-right text-[#2A2420]"
                  style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {vnd(b.totalPrice)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
