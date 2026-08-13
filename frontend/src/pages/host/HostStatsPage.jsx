import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import api from '../../services/api';

const vnd = (n) => Number(n).toLocaleString('vi-VN') + '₫';

const PERIODS = [
  { value: 'week',    label: 'Tuần'  },
  { value: 'month',   label: 'Tháng' },
  { value: 'quarter', label: 'Quý'   },
  { value: 'year',    label: 'Năm'   },
];

const PERIOD_LABELS = {
  week:    'trong tuần này',
  month:   'trong tháng này',
  quarter: 'trong quý này',
  year:    'trong năm này',
};

async function fetchHostStats(period) {
  const { data } = await api.get('/bookings/host/stats', { params: { period } });
  return data.data;
}

const ICONS = {
  revenue: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v2m0 8v2M9.5 10A2.5 2.5 0 0 1 12 8a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-1.5',
  booking: 'M3 4h18v18H3V4zm5-2v4m8-4v4M3 10h18M10 16l2 2 4-4',
  check:   'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  cancel:  'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
};

function Icon({ path, size = 14, opacity = 0.35 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#2F4A3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ opacity }}>
      <path d={path} />
    </svg>
  );
}

function SectionNum({ n, label }) {
  return (
    <div className="flex items-baseline gap-2 mb-5">
      <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 10, color: '#DDD4C4' }}>{n}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A89E97]">{label}</span>
    </div>
  );
}

function SmallCard({ label, value, iconPath, sub, valueColor = '#2F4A3E' }) {
  return (
    <div className="flex flex-col p-4"
      style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF' }}>
      <div className="flex items-start justify-between" style={{ minHeight: 32 }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A89E97] leading-tight">{label}</span>
        <Icon path={iconPath} />
      </div>
      <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 28, color: valueColor, lineHeight: 1, margin: '4px 0 6px' }}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] leading-snug mt-2 pt-2" style={{ borderTop: '1px dashed #DDD4C4', color: '#A89E97' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#2F4A3E', borderRadius: 4, padding: '4px 10px' }}>
      <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 12, color: '#FAF6EF', margin: 0 }}>
        {vnd(payload[0].value)}
      </p>
      <p style={{ fontSize: 10, color: 'rgba(250,246,239,0.6)', margin: 0 }}>{label}</p>
    </div>
  );
}

export default function HostStatsPage() {
  const [period, setPeriod] = useState('month');

  const { data, isLoading } = useQuery({
    queryKey: ['host-stats', period],
    queryFn: () => fetchHostStats(period),
    refetchInterval: 60000,
  });

  if (isLoading) return <p className="py-20 text-center text-sm text-[#A89E97]">Đang tải...</p>;
  if (!data) return null;

  const { totalRevenue, totalBookings, byStatus, chartData = [] } = data;
  const confirmed = byStatus?.approved ?? 0;
  const canceled  = byStatus?.canceled ?? 0;

  // Highlight cột cuối cùng có giá trị
  const lastNonZero = chartData.reduceRight((found, _, i) => found === -1 && chartData[i].value > 0 ? i : found, -1);

  return (
    <div className="space-y-10">

      {/* 01 Tổng quan */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <SectionNum n="01" label="Tổng quan doanh thu" />
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <SmallCard
            label="Doanh thu"
            value={vnd(totalRevenue)}
            iconPath={ICONS.revenue}
            valueColor="#C17A54"
            sub={PERIOD_LABELS[period]}
          />
          <SmallCard
            label="Tổng booking"
            value={totalBookings}
            iconPath={ICONS.booking}
            sub={`Xác nhận: ${confirmed} · Đã huỷ: ${canceled}`}
          />
          <SmallCard
            label="Đã xác nhận"
            value={confirmed}
            iconPath={ICONS.check}
          />
          <SmallCard
            label="Đã huỷ"
            value={canceled}
            iconPath={ICONS.cancel}
            valueColor={canceled > 0 ? '#B85C38' : '#2F4A3E'}
          />
        </div>
      </section>

      {/* 02 Biểu đồ */}
      <section>
        <SectionNum n="02" label={`Doanh thu theo ${PERIODS.find(p => p.value === period)?.label.toLowerCase()}`} />
        {chartData.every((d) => d.value === 0) ? (
          <p className="py-12 text-center text-sm text-[#A89E97]">Chưa có doanh thu trong khoảng này</p>
        ) : (
          <div className="p-5" style={{ border: '1.5px solid #A8B5A0', borderRadius: 6, backgroundColor: '#FAF6EF' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
                  barSize={period === 'month' ? 14 : period === 'quarter' ? 20 : 28}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#A89E97', fontFamily: 'Be Vietnam Pro, sans-serif' }}
                    axisLine={false} tickLine={false}
                    interval={period === 'month' ? 4 : 0}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(47,74,62,0.05)' }} />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === lastNonZero ? '#C17A54' : '#A8B5A0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* 03 Link nhanh */}
      <section>
        <SectionNum n="03" label="Quản lý" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { to: '/host/bookings', label: 'Xem tất cả booking →' },
            { to: '/host/calendar', label: 'Quản lý lịch →' },
            { to: '/host/pricing',  label: 'Quản lý giá →' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="block px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-center transition-colors"
              style={{ border: '1px solid #2F4A3E', color: '#2F4A3E', borderRadius: 6, backgroundColor: '#FAF6EF' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2F4A3E'; e.currentTarget.style.color = '#FAF6EF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FAF6EF'; e.currentTarget.style.color = '#2F4A3E'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
