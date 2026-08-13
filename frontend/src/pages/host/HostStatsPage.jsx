import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import api from '../../services/api';

const vnd = (n) => Number(n).toLocaleString('vi-VN') + '₫';

async function fetchHostStats() {
  const { data } = await api.get('/bookings/host/stats');
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
    <div className="flex flex-col justify-between p-4"
      style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF', minHeight: 0 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A89E97] leading-tight">{label}</span>
        <Icon path={iconPath} size={14} opacity={0.35} />
      </div>
      <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 28, color: valueColor, lineHeight: 1, margin: '6px 0' }}>
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
  const { data, isLoading } = useQuery({
    queryKey: ['host-stats'],
    queryFn: fetchHostStats,
    refetchInterval: 60000,
  });

  if (isLoading) return <p className="py-20 text-center text-sm text-[#A89E97]">Đang tải...</p>;
  if (!data) return null;

  const { totalRevenue, totalBookings, byStatus, monthlyRevenue } = data;
  const confirmed = byStatus?.approved ?? 0;
  const canceled  = byStatus?.canceled ?? 0;

  const chartData = (monthlyRevenue ?? []).map(({ month, revenue }) => ({
    label: month.slice(5) + '/' + month.slice(0, 4),
    value: revenue,
  }));

  return (
    <div className="space-y-10">

      {/* 01 Tổng quan */}
      <section>
        <SectionNum n="01" label="Tổng quan doanh thu" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <SmallCard
            label="Tổng doanh thu"
            value={vnd(totalRevenue)}
            iconPath={ICONS.revenue}
            valueColor="#C17A54"
            sub="Chỉ tính booking đã xác nhận"
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

      {/* 02 Biểu đồ doanh thu theo tháng */}
      <section>
        <SectionNum n="02" label="Doanh thu theo tháng" />
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#A89E97]">Chưa có doanh thu</p>
        ) : (
          <div className="p-5" style={{ border: '1.5px solid #A8B5A0', borderRadius: 6, backgroundColor: '#FAF6EF' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barSize={28}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#A89E97', fontFamily: 'Be Vietnam Pro, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(47,74,62,0.05)' }} />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === chartData.length - 1 ? '#C17A54' : '#A8B5A0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-[#A89E97] mt-3">Tháng hiện tại được tô đậm</p>
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
              className="block px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors text-center"
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
