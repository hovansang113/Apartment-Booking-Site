import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import ReasonModal from '../../components/admin/ReasonModal';
import * as adminService from '../../services/adminService';

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

// REQ_04 - admin khoa/mo khoa tai khoan
export default function AdminUsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [lockingId, setLockingId] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: adminService.getUsers });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.lockUser(id, reason),
    onSuccess: () => {
      toast.success(t('admin.users.lockSuccess'));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, t('admin.users.lockErrorFallback'))),
  });

  const unlockMutation = useMutation({
    mutationFn: (id) => adminService.unlockUser(id),
    onSuccess: () => {
      toast.success(t('admin.users.unlockSuccess'));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, t('admin.users.unlockErrorFallback'))),
  });

  const users = data || [];

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('admin.users.pageTitle')}</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('admin.users.heading')}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('admin.users.subheading')}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">{t('admin.users.loading')}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase text-neutral-500">
                <th className="px-4 py-3">{t('admin.users.colUser')}</th>
                <th className="px-4 py-3">{t('admin.users.colRole')}</th>
                <th className="px-4 py-3">{t('admin.users.colStatus')}</th>
                <th className="px-4 py-3">{t('admin.users.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{u.fullName}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{t(`admin.users.roleLabel.${u.role}`, { defaultValue: u.role })}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        u.status === 'locked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.status === 'locked' ? t('admin.users.statusLocked') : t('admin.users.statusActive')}
                    </span>
                    {u.lockedReason && <p className="mt-1 text-xs text-red-600">{t('admin.users.lockedReasonLabel', { reason: u.lockedReason })}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="text-xs text-neutral-400">—</span>
                    ) : u.status === 'locked' ? (
                      <button
                        type="button"
                        disabled={unlockMutation.isPending}
                        onClick={() => unlockMutation.mutate(u.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {t('admin.users.unlock')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLockingId(u.id)}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        {t('admin.users.lock')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lockingId && (
        <ReasonModal
          title={t('admin.users.lockModalTitle')}
          confirmLabel={t('admin.users.lockModalTitle')}
          onClose={() => setLockingId(null)}
          onConfirm={(reason) => lockMutation.mutateAsync({ id: lockingId, reason })}
        />
      )}
    </AdminLayout>
  );
}
