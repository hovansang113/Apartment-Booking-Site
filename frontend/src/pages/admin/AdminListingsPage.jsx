import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import ReasonModal from '../../components/admin/ReasonModal';
import * as adminService from '../../services/adminService';

const STATUS_TABS = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'suspended', label: 'Bị đình chỉ' },
];

const STATUS_BADGE = {
  pending: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
};

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

// REQ_03 - admin duyet/dinh chi tin dang. Mac dinh xem tab "Cho duyet" vi day
// la hang doi can xu ly nhat.
export default function AdminListingsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [suspendingId, setSuspendingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', status],
    queryFn: () => adminService.getListings(status),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
  }

  const approveMutation = useMutation({
    mutationFn: (id) => adminService.approveListing(id),
    onSuccess: () => {
      toast.success('Đã duyệt tin đăng');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Duyệt thất bại')),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.suspendListing(id, reason),
    onSuccess: () => {
      toast.success('Đã đình chỉ tin đăng');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Đình chỉ thất bại')),
  });

  const listings = data || [];

  return (
    <AdminLayout>
      <Helmet>
        <title>Duyệt tin đăng — Stayhub Admin</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Duyệt tin đăng</h1>
        <p className="mt-1 text-sm text-neutral-500">Xem và xử lý các bài đăng theo trạng thái.</p>
      </div>

      <div className="mb-5 inline-flex rounded-full bg-neutral-100 p-1 text-sm font-semibold">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-4 py-2 transition-colors ${
              status === tab.value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Đang tải...</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">Không có tin đăng nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
              <img
                src={listing.images?.[0]?.imageUrl || 'https://placehold.co/100x100?text=No+image'}
                alt={listing.title}
                className="h-16 w-20 shrink-0 rounded-xl object-cover bg-neutral-100"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-neutral-900">{listing.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[listing.status]}`}>
                    {STATUS_TABS.find((t) => t.value === listing.status)?.label || listing.status}
                  </span>
                </div>
                <p className="truncate text-xs text-neutral-500">{listing.address}</p>
                <p className="text-xs text-neutral-400">
                  Host: {listing.host?.fullName} ({listing.host?.email})
                </p>
                {listing.suspendReason && (
                  <p className="mt-1 text-xs text-red-600">Lý do đình chỉ: {listing.suspendReason}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {listing.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(listing.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                )}
                {listing.status !== 'suspended' && (
                  <button
                    type="button"
                    onClick={() => setSuspendingId(listing.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Đình chỉ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {suspendingId && (
        <ReasonModal
          title="Đình chỉ tin đăng"
          confirmLabel="Đình chỉ"
          onClose={() => setSuspendingId(null)}
          onConfirm={(reason) => suspendMutation.mutateAsync({ id: suspendingId, reason })}
        />
      )}
    </AdminLayout>
  );
}
