import { useState } from 'react';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import ReasonModal from '../../components/admin/ReasonModal';
import * as adminService from '../../services/adminService';

const STATUS_VALUES = ['pending', 'approved', 'suspended'];

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
  const { t } = useTranslation();
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
      toast.success(t('admin.listings.approveSuccess'));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, t('admin.listings.approveErrorFallback'))),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.suspendListing(id, reason),
    onSuccess: () => {
      toast.success(t('admin.listings.suspendSuccess'));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, t('admin.listings.suspendErrorFallback'))),
  });

  const listings = data || [];

  return (
    <AdminLayout>
      <Seo title={t('admin.listings.pageTitle')} noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('admin.listings.heading')}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('admin.listings.subheading')}</p>
      </div>

      <div className="mb-5 inline-flex rounded-full bg-neutral-100 p-1 text-sm font-semibold">
        {STATUS_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-4 py-2 transition-colors ${
              status === value ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
            }`}
          >
            {t(`admin.listings.tabs.${value}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">{t('admin.listings.loading')}</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">{t('admin.listings.empty')}</p>
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
                    {t(`admin.listings.tabs.${listing.status}`, { defaultValue: listing.status })}
                  </span>
                </div>
                <p className="truncate text-xs text-neutral-500">{listing.address}</p>
                <p className="text-xs text-neutral-400">
                  {t('admin.listings.hostLabel', { name: listing.host?.fullName, email: listing.host?.email })}
                </p>
                {listing.suspendReason && (
                  <p className="mt-1 text-xs text-red-600">{t('admin.listings.suspendReasonLabel', { reason: listing.suspendReason })}</p>
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
                    {t('admin.listings.approve')}
                  </button>
                )}
                {listing.status !== 'suspended' && (
                  <button
                    type="button"
                    onClick={() => setSuspendingId(listing.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t('admin.listings.suspend')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {suspendingId && (
        <ReasonModal
          title={t('admin.listings.suspendModalTitle')}
          confirmLabel={t('admin.listings.suspend')}
          onClose={() => setSuspendingId(null)}
          onConfirm={(reason) => suspendMutation.mutateAsync({ id: suspendingId, reason })}
        />
      )}
    </AdminLayout>
  );
}
