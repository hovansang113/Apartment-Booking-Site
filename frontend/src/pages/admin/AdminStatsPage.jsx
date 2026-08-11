import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../../services/adminService';
import { Link } from 'react-router-dom';

const vnd = (n) => Number(n).toLocaleString('vi-VN') + 'đ';
const fmt = (d) => new Date(d).toLocaleDateString('vi-VN');

function StatCard({ label, value, sub, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[color].split(' ')[1]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function AdminStatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 60000,
  });

  if (isLoading) return <p className="text-center text-gray-400 py-16">Đang tải...</p>;
  if (!data) return null;

  const { users, listings, bookings, revenue, recentBookings, pendingListings } = data;

  const growthLabel =
    revenue.growthPercent === null
      ? 'Chưa có dữ liệu tháng trước'
      : revenue.growthPercent >= 0
      ? `↑ ${revenue.growthPercent}% so tháng trước`
      : `↓ ${Math.abs(revenue.growthPercent)}% so tháng trước`;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Tổng doanh thu" value={vnd(revenue.total)} sub={`Tháng này: ${vnd(revenue.thisMonth)}`} color="teal" />
        <StatCard label="Tháng này" value={vnd(revenue.thisMonth)} sub={growthLabel} color="blue" />
        <StatCard label="Booking" value={bookings.total} sub={`Đã huỷ: ${bookings.canceled}`} color="yellow" />
        <StatCard label="Người dùng" value={users.total} sub={`${users.hosts} host · ${users.guests} guest`} color="blue" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Listing đã duyệt" value={listings.approved} color="teal" />
        <StatCard label="Chờ duyệt" value={listings.pending} color="yellow" />
        <StatCard label="Đình chỉ" value={listings.suspended} color="red" />
      </div>

      {/* Pending listings */}
      {pendingListings.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Listing chờ duyệt</h2>
            <Link to="/admin/listings" className="text-sm text-teal-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {pendingListings.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                {l.image
                  ? <img src={l.image} alt={l.title} className="h-14 w-20 rounded-lg object-cover shrink-0" />
                  : <div className="h-14 w-20 rounded-lg bg-gray-200 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{l.title}</p>
                  <p className="text-sm text-gray-500">{l.hostName} · {l.hostEmail}</p>
                  <p className="text-xs text-gray-400">Gửi lúc {fmt(l.createdAt)}</p>
                </div>
                <Link
                  to="/admin/listings"
                  className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700"
                >
                  Xét duyệt
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-900">Booking gần đây</h2>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có booking nào</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Khách</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Ngày ở</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.guestName}</p>
                      <p className="text-gray-400">{b.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.listingTitle}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {fmt(b.checkIn)} → {fmt(b.checkOut)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {vnd(b.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
