import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';

const vnd = (n) => Number(n).toLocaleString('vi-VN') + 'đ';
const fmt = (d) => new Date(d).toLocaleDateString('vi-VN');

async function fetchBooking(bookingId) {
  const { data } = await api.get(`/payments/${bookingId}`);
  return data.data;
}

async function confirmPayment(bookingId) {
  const { data } = await api.post(`/payments/${bookingId}/confirm`);
  return data.data;
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['payment', bookingId],
    queryFn: () => fetchBooking(bookingId),
  });

  const mutation = useMutation({
    mutationFn: () => confirmPayment(bookingId),
    onSuccess: () => {
      setPaid(true);
      toast.success('Thanh toán thành công!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  if (isLoading) return <main className="py-24 text-center text-gray-400">Đang tải...</main>;
  if (isError || !booking) return (
    <main className="py-24 text-center">
      <p className="text-gray-500">Không tìm thấy đặt phòng này.</p>
      <Link to="/bookings" className="mt-4 inline-block text-teal-600 underline">Về trang booking</Link>
    </main>
  );

  const nights = Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000);
  const thumb = booking.listing?.images?.[0]?.imageUrl;

  if (paid || booking.payment) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt phòng thành công!</h1>
        <p className="text-gray-500 mb-6">
          Cảm ơn bạn đã đặt phòng tại <strong>{booking.listing?.title}</strong>.
          Chúng tôi sẽ liên hệ xác nhận qua email.
        </p>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-left mb-6 space-y-1">
          <p><span className="text-gray-500">Nhận phòng:</span> <strong>{fmt(booking.checkIn)}</strong></p>
          <p><span className="text-gray-500">Trả phòng:</span> <strong>{fmt(booking.checkOut)}</strong></p>
          <p><span className="text-gray-500">Tổng tiền:</span> <strong className="text-teal-700">{vnd(booking.totalPrice)}</strong></p>
        </div>
        <Link
          to="/bookings"
          className="inline-block rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Xem đặt phòng của tôi
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Xác nhận thanh toán</h1>

      {/* Listing info */}
      <div className="mb-6 flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
        {thumb
          ? <img src={thumb} alt={booking.listing?.title} className="h-20 w-28 rounded-lg object-cover shrink-0" />
          : <div className="h-20 w-28 rounded-lg bg-gray-100 shrink-0" />
        }
        <div>
          <p className="font-semibold text-gray-900">{booking.listing?.title}</p>
          <p className="text-sm text-gray-500">{booking.listing?.address}</p>
          <p className="mt-1 text-sm text-gray-600">
            {fmt(booking.checkIn)} → {fmt(booking.checkOut)} · {nights} đêm
          </p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Giá phòng × {nights} đêm</span>
          <span>{vnd(booking.totalPrice)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
          <span>Tổng thanh toán</span>
          <span className="text-teal-700">{vnd(booking.totalPrice)}</span>
        </div>
      </div>

      {/* Simulated payment methods */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="radio" defaultChecked className="accent-teal-600" />
          <span className="text-sm text-gray-800">💳 Thẻ tín dụng / Ghi nợ (giả lập)</span>
        </label>
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
      >
        {mutation.isPending ? 'Đang xử lý...' : `Thanh toán ${vnd(booking.totalPrice)}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Đây là thanh toán giả lập — không có tiền thật bị trừ.
      </p>
    </main>
  );
}
