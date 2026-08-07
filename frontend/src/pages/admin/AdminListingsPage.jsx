import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminListings, updateListingStatus } from '../../services/adminService';

const TABS = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'suspended', label: 'Đình chỉ' },
];

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
};

export default function AdminListingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [suspendModal, setSuspendModal] = useState(null); // { id, title }
  const [suspendReason, setSuspendReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', tab],
    queryFn: () => getAdminListings(tab),
  });

  const listings = data?.listings ?? [];
  const total = data?.total ?? 0;

  const mutation = useMutation({
    mutationFn: ({ id, status, suspendReason }) => updateListingStatus(id, status, suspendReason),
    onSuccess: (_, { status }) => {
      toast.success(status === 'approved' ? 'Đã duyệt listing' : 'Đã đình chỉ listing');
      qc.invalidateQueries({ queryKey: ['admin-listings'] });
      setSuspendModal(null);
      setSuspendReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  function handleApprove(id) {
    mutation.mutate({ id, status: 'approved' });
  }

  function handleSuspendSubmit() {
    if (!suspendReason.trim()) {
      toast.error('Vui lòng nhập lý do đình chỉ');
      return;
    }
    mutation.mutate({ id: suspendModal.id, status: 'suspended', suspendReason });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý listing</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.value
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-16">Đang tải...</p>
        ) : listings.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Không có listing nào</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Tổng: {total} listing</p>
            {listings.map((listing) => {
              const thumb = listing.images?.[0]?.imageUrl;
              return (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">
                  {thumb ? (
                    <img src={thumb} alt={listing.title} className="w-28 h-20 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-28 h-20 bg-gray-100 rounded-lg shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-gray-900">{listing.title}</h2>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[listing.status]}`}>
                        {TABS.find((t) => t.value === listing.status)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{listing.address}</p>
                    <p className="text-sm text-gray-500">
                      Host: <span className="text-gray-700">{listing.host?.fullName}</span>
                      {' · '}{listing.host?.email}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {Number(listing.defaultPrice).toLocaleString('vi-VN')}đ / đêm
                    </p>
                    {listing.suspendReason && (
                      <p className="text-xs text-red-500 mt-1">Lý do đình chỉ: {listing.suspendReason}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {listing.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={mutation.isPending}
                        className="text-sm text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Duyệt
                      </button>
                    )}
                    {listing.status !== 'suspended' && (
                      <button
                        onClick={() => setSuspendModal({ id: listing.id, title: listing.title })}
                        className="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Đình chỉ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suspend modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-gray-900 mb-1">Đình chỉ listing</h2>
            <p className="text-sm text-gray-500 mb-4">"{suspendModal.title}"</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do đình chỉ..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setSuspendModal(null); setSuspendReason(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSuspendSubmit}
                disabled={mutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
              >
                Xác nhận đình chỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
