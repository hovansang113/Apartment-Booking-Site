import Seo from '../../components/common/Seo';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import * as adminService from '../../services/adminService';

const METRICS = [
  ['usersTotal', 'users'],
  ['hostsTotal', 'hosts'],
  ['guestsTotal', 'guests'],
  ['listingsTotal', 'listings'],
  ['pendingListings', 'pendingListings'],
  ['approvedListings', 'approvedListings'],
  ['confirmedBookings', 'confirmedBookings'],
  ['pendingPaymentBookings', 'pendingPaymentBookings'],
  ['pendingTaxProfiles', 'pendingTaxProfiles'],
  ['successfulPaymentTotal', 'successfulPaymentTotal'],
];

const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard-analytics'],
    queryFn: adminService.getDashboardAnalytics,
  });

  return (
    <AdminLayout>
      <Seo title={t('admin.dashboard.pageTitle')} noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('admin.dashboard.heading')}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('admin.dashboard.subheading')}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">{t('admin.dashboard.loading')}</p>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{t('admin.dashboard.error')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-sm font-semibold text-red-700 underline"
          >
            {t('admin.dashboard.retry')}
          </button>
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <dt className="text-sm font-medium text-neutral-500">{t(`admin.dashboard.${label}`)}</dt>
              <dd className="mt-2 text-2xl font-bold text-neutral-900">
                {key === 'successfulPaymentTotal' ? currency.format(data[key]) : data[key].toLocaleString('en-GB')}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </AdminLayout>
  );
}
