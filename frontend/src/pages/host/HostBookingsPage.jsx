import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

async function getHostListingsWithBookings() {
  const { data } = await api.get('/listings/mine');
  return data.data;
}

async function getBookingsForListing(listingId) {
  const { data } = await api.get(`/bookings/listing/${listingId}`);
  return data.data;
}

const STATUS_LABEL = {
  approved: { text: 'Đã xác nhận', cls: 'bg-green-100 text-green-700' },
  canceled: { text: 'Khách đã huỷ', cls: 'bg-gray-100 text-gray-500' },
  rejected: { text: 'Đã từ chối', cls: 'bg-red-100 text-red-700' },
  pending: { text: 'Chờ xử lý', cls: 'bg-yellow-100 text-yellow-700' },
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
});

function BookingList({ listingId }) {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['host-bookings', listingId],
    queryFn: () => getBookingsForListing(listingId),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejectedReason }) =>
      api.patch(`/bookings/${id}/reject`, { rejectedReason }).then(r => r.data),
    onSuccess: () => {
      toast.success('Đã từ chối booking');
      qc.invalidateQueries({ queryKey: ['host-bookings', listingId] });
      setRejectModal(null);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  if (isLoading) return <p className="text-sm text-gray-400 py-4">Đang tải...</p>;
  if (bookings.length === 0) return <p className="text-sm text-gray-400 py-4">Chưa có booking nào</p>;

  return (
    <>
      <div className="space-y-3 mt-3">
        {bookings.map((booking) => {
          const badge = STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending;
          return (
            <div key={booking.id} className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{booking.contactName || booking.guest?.fullName}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.text}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{booking.contactEmail || booking.guest?.email} · {booking.contactPhone || booking.guest?.phone || 'Chưa có SĐT'}</p>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(booking.checkIn).toLocaleDateString('vi-VN')} →{' '}
                  {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm font-medium text-gray-800">{currencyFormatter.format(booking.totalPrice)}</p>
                {booking.rejectedReason && (
                  <p className="text-xs text-red-500 mt-1">Lý do từ chối: {booking.rejectedReason}</p>
                )}
              </div>
              {booking.status === 'approved' && (
                <button
                  onClick={() => setRejectModal(booking)}
                  className="shrink-0 text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  Từ chối
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-gray-900 mb-1">Từ chối booking</h2>
            <p className="text-sm text-gray-500 mb-4">Khách: {rejectModal.guest?.fullName}</p>
            <form onSubmit={handleSubmit(({ rejectedReason }) =>
              rejectMutation.mutate({ id: rejectModal.id, rejectedReason })
            )}>
              <textarea
                {...register('rejectedReason', { required: true })}
                rows={3}
                placeholder="Nhập lý do từ chối..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setRejectModal(null); reset(); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">
                  Huỷ
                </button>
                <button type="submit" disabled={rejectMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm">
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function HostBookingsPage() {
  const [openId, setOpenId] = useState(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['host-listings'],
    queryFn: getHostListingsWithBookings,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý booking</h1>

      {isLoading ? (
        <p className="text-center text-gray-400 py-16">Đang tải...</p>
      ) : listings.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Bạn chưa có phòng nào</p>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenId(openId === listing.id ? null : listing.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left"
              >
                {listing.images?.[0]?.imageUrl && (
                  <img src={listing.images[0].imageUrl} alt={listing.title}
                    className="w-16 h-12 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
                  <p className="text-sm text-gray-500 truncate">{listing.address}</p>
                </div>
                <span className="text-gray-400 shrink-0">{openId === listing.id ? '▲' : '▼'}</span>
              </button>

              {openId === listing.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <BookingList listingId={listing.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
