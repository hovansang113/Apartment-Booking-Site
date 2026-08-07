import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../services/bookingService';

const STATUS_LABEL = {
  approved: { text: 'Đã xác nhận', cls: 'bg-green-100 text-green-700' },
  canceled: { text: 'Đã huỷ', cls: 'bg-gray-100 text-gray-500' },
  rejected: { text: 'Bị từ chối', cls: 'bg-red-100 text-red-700' },
  pending: { text: 'Chờ xử lý', cls: 'bg-yellow-100 text-yellow-700' },
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
});

export default function MyBookingsPage() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: getMyBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      toast.success('Đã huỷ đặt phòng');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Huỷ thất bại'),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đặt phòng</h1>

      {isLoading ? (
        <p className="text-center text-gray-400 py-16">Đang tải...</p>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Bạn chưa có đặt phòng nào</p>
          <Link to="/" className="text-teal-600 font-medium hover:underline">Tìm phòng ngay →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const thumb = booking.listing?.images?.[0]?.imageUrl;
            const badge = STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending;
            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                {thumb ? (
                  <img src={thumb} alt={booking.listing?.title} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-24 h-20 bg-gray-100 rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/listings/${booking.listingId}`} className="font-semibold text-gray-900 hover:underline truncate">
                      {booking.listing?.title}
                    </Link>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{booking.listing?.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(booking.checkIn).toLocaleDateString('vi-VN')} →{' '}
                    {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {currencyFormatter.format(booking.totalPrice)}
                  </p>
                  {booking.rejectedReason && (
                    <p className="text-xs text-red-500 mt-1">Lý do: {booking.rejectedReason}</p>
                  )}
                </div>
                {booking.status === 'approved' && (
                  <button
                    onClick={() => cancelMutation.mutate(booking.id)}
                    disabled={cancelMutation.isPending}
                    className="shrink-0 text-sm text-red-500 hover:underline self-start"
                  >
                    Huỷ
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
