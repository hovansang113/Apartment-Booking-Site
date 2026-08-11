import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminUsers, updateUserStatus } from '../../services/adminService';

const ROLE_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'host', label: 'Chủ nhà' },
  { value: 'user', label: 'Người dùng' },
];

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700',
  locked: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => getAdminUsers({ role: role || undefined }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: (_, { status }) => {
      toast.success(status === 'locked' ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const users = data?.users ?? [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Người dùng</h1>

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {ROLE_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setRole(t.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              role === t.value
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-gray-400">Đang tải...</p>
      ) : users.length === 0 ? (
        <p className="py-16 text-center text-gray-400">Không có người dùng nào</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Listing / Booking</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.fullName}</p>
                    <p className="text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{u.role === 'host' ? 'Chủ nhà' : 'Người dùng'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {u._count.listings} listing · {u._count.bookings} booking
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[u.status]}`}>
                      {u.status === 'active' ? 'Hoạt động' : 'Đã khoá'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.status === 'active' ? (
                      <button
                        onClick={() => mutation.mutate({ id: u.id, status: 'locked' })}
                        disabled={mutation.isPending}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        Khoá
                      </button>
                    ) : (
                      <button
                        onClick={() => mutation.mutate({ id: u.id, status: 'active' })}
                        disabled={mutation.isPending}
                        className="text-sm text-teal-600 hover:underline disabled:opacity-50"
                      >
                        Mở khoá
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
