import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getBookingByGuestToken, cancelBookingByGuestToken } from '../../services/bookingService';

const STATUS_LABEL = {
  approved: { text: 'Đã xác nhận', cls: 'bg-green-100 text-green-700' },
  canceled: { text: 'Đã huỷ', cls: 'bg-gray-100 text-gray-500' },
  rejected: { text: 'Bị từ chối', cls: 'bg-red-100 text-red-700' },
  pending: { text: 'Chờ xử lý', cls: 'bg-yellow-100 text-yellow-700' },
};

const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

function formatDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function nights(checkIn, checkOut) {
  return Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
}

export default function GuestBookingPage() {
  const { token } = useParams();
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['guest-booking', token],
    queryFn: () => getBookingByGuestToken(token),
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBookingByGuestToken(token),
    onSuccess: () => {
      toast.success('Đã huỷ đặt phòng thành công');
      qc.invalidateQueries({ queryKey: ['guest-booking', token] });
      setConfirming(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Huỷ thất bại, vui lòng thử lại');
      setConfirming(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Đang tải thông tin đặt phòng...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-700 font-medium text-center">Không tìm thấy đặt phòng.</p>
        <p className="text-gray-400 text-sm text-center">Link có thể đã hết hạn hoặc không hợp lệ.</p>
        <Link to="/" className="text-teal-600 hover:underline text-sm">Về trang chủ</Link>
      </div>
    );
  }

  const badge = STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending;
  const thumb = booking.listing?.images?.[0]?.imageUrl;
  const n = nights(booking.checkIn, booking.checkOut);
  const canCancel = booking.status === 'approved' || booking.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="text-sm text-teal-600 hover:underline">← Về trang chủ</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Chi tiết đặt phòng</h1>
          <p className="text-xs text-gray-400 mt-1">Mã booking: {booking.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Listing thumbnail */}
          {thumb && (
            <img src={thumb} alt={booking.listing?.title} className="w-full h-48 object-cover" />
          )}

          <div className="p-6 space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                {booking.listing?.title}
              </h2>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${badge.cls}`}>
                {badge.text}
              </span>
            </div>

            <p className="text-sm text-gray-500">{booking.listing?.address}</p>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Nhận phòng</p>
                <p className="font-semibold text-gray-800 text-sm">{formatDate(booking.checkIn)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Trả phòng</p>
                <p className="font-semibold text-gray-800 text-sm">{formatDate(booking.checkOut)}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Số đêm</span>
                <span>{n} đêm</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Tổng tiền</span>
                <span>{fmt.format(booking.totalPrice)}</span>
              </div>
            </div>

            {/* Contact info */}
            <div className="border-t pt-4 space-y-1.5">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Thông tin liên hệ</p>
              <p className="text-sm text-gray-700"><span className="text-gray-400">Tên:</span> {booking.contactName}</p>
              <p className="text-sm text-gray-700"><span className="text-gray-400">Email:</span> {booking.contactEmail}</p>
              {booking.contactPhone && (
                <p className="text-sm text-gray-700"><span className="text-gray-400">SĐT:</span> {booking.contactPhone}</p>
              )}
            </div>

            {/* Rejected reason */}
            {booking.rejectedReason && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-xs text-red-500 font-medium mb-0.5">Lý do từ chối</p>
                <p className="text-sm text-red-700">{booking.rejectedReason}</p>
              </div>
            )}

            {/* Cancel */}
            {canCancel && (
              <div className="border-t pt-4">
                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    className="w-full py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                  >
                    Huỷ đặt phòng
                  </button>
                ) : (
                  <div className="bg-red-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-red-700 font-medium">Bạn có chắc muốn huỷ đặt phòng này?</p>
                    <p className="text-xs text-gray-500">Hành động này không thể hoàn tác.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition"
                      >
                        {cancelMutation.isPending ? 'Đang huỷ...' : 'Xác nhận huỷ'}
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        disabled={cancelMutation.isPending}
                        className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition"
                      >
                        Không
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Link này chỉ dành riêng cho bạn. Vui lòng không chia sẻ với người khác.
        </p>
      </div>
    </div>
  );
}
