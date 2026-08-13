import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import ReasonModal from '../../components/admin/ReasonModal';
import * as adminService from '../../services/adminService';

const ROLE_LABEL = { admin: 'Admin', host: 'Chủ nhà', user: 'Khách' };

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

// REQ_04 - admin khoa/mo khoa tai khoan
export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [lockingId, setLockingId] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: adminService.getUsers });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.lockUser(id, reason),
    onSuccess: () => {
      toast.success('Đã khoá tài khoản');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Khoá thất bại')),
  });

  const unlockMutation = useMutation({
    mutationFn: (id) => adminService.unlockUser(id),
    onSuccess: () => {
      toast.success('Đã mở khoá tài khoản');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Mở khoá thất bại')),
  });

  const users = data || [];

  return (
    <AdminLayout>
      <Helmet>
        <title>Người dùng — Stayhub Admin</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Người dùng</h1>
        <p className="mt-1 text-sm text-neutral-500">Quản lý tài khoản, khoá/mở khoá khi cần.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase text-neutral-500">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{u.fullName}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{ROLE_LABEL[u.role] || u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        u.status === 'locked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.status === 'locked' ? 'Đã khoá' : 'Đang hoạt động'}
                    </span>
                    {u.lockedReason && <p className="mt-1 text-xs text-red-600">Lý do: {u.lockedReason}</p>}
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
                        Mở khoá
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLockingId(u.id)}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Khoá
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
          title="Khoá tài khoản"
          confirmLabel="Khoá tài khoản"
          onClose={() => setLockingId(null)}
          onConfirm={(reason) => lockMutation.mutateAsync({ id: lockingId, reason })}
        />
      )}
    </AdminLayout>
  );
}
