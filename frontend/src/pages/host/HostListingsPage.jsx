import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getHostListings, deleteListing } from '../../services/listingService';

const STATUS_LABEL = {
  pending: { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
  suspended: { text: 'Đình chỉ', cls: 'bg-red-100 text-red-700' },
};

export default function HostListingsPage() {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['host-listings'],
    queryFn: getHostListings,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success('Đã xoá phòng');
      qc.invalidateQueries({ queryKey: ['host-listings'] });
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
      setDeletingId(null);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Phòng của tôi</h1>
          <Link
            to="/host/listings/new"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Thêm phòng mới
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-16">Đang tải...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">Bạn chưa có phòng nào</p>
            <Link to="/host/listings/new" className="text-teal-600 font-medium hover:underline">
              Tạo phòng đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const thumb = listing.images?.[0]?.imageUrl;
              const badge = STATUS_LABEL[listing.status];
              return (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">
                  {thumb ? (
                    <img src={thumb} alt={listing.title} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-24 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-gray-900 truncate">{listing.title}</h2>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{listing.address}</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {Number(listing.defaultPrice).toLocaleString('vi-VN')}đ / đêm
                    </p>
                    {listing.status === 'suspended' && listing.suspendReason && (
                      <p className="text-xs text-red-500 mt-1">Lý do: {listing.suspendReason}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      to={`/host/listings/${listing.id}/edit`}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      Chỉnh sửa
                    </Link>
                    {deletingId === listing.id ? (
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => deleteMutation.mutate(listing.id)}
                          className="text-red-600 font-medium hover:underline"
                        >
                          Xác nhận
                        </button>
                        <button onClick={() => setDeletingId(null)} className="text-gray-400 hover:underline">
                          Huỷ
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(listing.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
