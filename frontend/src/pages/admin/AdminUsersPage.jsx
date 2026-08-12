import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminUsers, updateUserStatus } from '../../services/adminService';

const ROLE_TABS = [
  { value: '',     label: 'All'   },
  { value: 'host', label: 'Hosts' },
  { value: 'user', label: 'Users' },
];
const ROLE_TEXT = { admin: 'Admin', host: 'Host', user: 'User' };

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 shrink-0 flex items-center justify-center text-white text-[12px] font-semibold"
      style={{ backgroundColor: '#2F4A3E', borderRadius: 3, fontFamily: 'Fraunces, Georgia, serif' }}>
      {getInitials(name)}
    </div>
  );
}

function SectionNum({ n, label }) {
  return (
    <div className="flex items-baseline gap-2 mb-5">
      <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 10, color: '#DDD4C4' }}>{n}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A89E97]">{label}</span>
    </div>
  );
}

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
      toast.success(status === 'locked' ? 'Account locked' : 'Account unlocked');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
  });

  const users = data?.users ?? [];

  return (
    <div>
      <SectionNum n="01" label="Users" />

      <div className="flex mb-6" style={{ borderBottom: '1px solid #DDD4C4' }}>
        {ROLE_TABS.map((t) => (
          <button key={t.value} onClick={() => setRole(t.value)}
            className="py-2.5 mr-7 text-[13px] transition-colors"
            style={{
              borderBottom: `2px solid ${role === t.value ? '#C17A54' : 'transparent'}`,
              color: role === t.value ? '#2A2420' : '#A89E97',
              fontWeight: role === t.value ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-20 text-center text-sm text-[#A89E97]">Loading...</p>
      ) : users.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#A89E97]">No users found</p>
      ) : (
        <div style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF', overflow: 'hidden' }}>
          <div className="grid px-5 py-3"
            style={{ gridTemplateColumns: '2.5fr 1fr 1.4fr 1fr 80px', borderBottom: '1px solid #DDD4C4' }}>
            {['Name', 'Role', 'Listings / Bookings', 'Status', ''].map((h) => (
              <span key={h} className="text-[11px] italic text-[#A89E97]">{h}</span>
            ))}
          </div>

          {users.map((u, i) => (
            <div key={u.id} className="grid items-center px-5 py-4"
              style={{ gridTemplateColumns: '2.5fr 1fr 1.4fr 1fr 80px', borderTop: i > 0 ? '1px dashed #DDD4C4' : 'none' }}>
              <div className="flex items-center gap-2.5">
                <Avatar name={u.fullName} />
                <div>
                  <p className="text-[13px] font-semibold text-[#2A2420]">{u.fullName}</p>
                  <p className="text-[10px] text-[#A89E97] mt-0.5">{u.email}</p>
                  {u.phone && <p className="text-[10px] text-[#DDD4C4]">{u.phone}</p>}
                </div>
              </div>

              <p className="text-[12px] text-[#6B5F58]">{ROLE_TEXT[u.role] ?? u.role}</p>

              <p className="text-[11px] text-[#A89E97]">
                {u._count.listings} listing{u._count.listings !== 1 ? 's' : ''} · {u._count.bookings} booking{u._count.bookings !== 1 ? 's' : ''}
              </p>

              <span className="inline-flex items-center gap-1.5 text-[12px]"
                style={{ color: u.status === 'active' ? '#2F4A3E' : '#B85C38' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: u.status === 'active' ? '#2F4A3E' : '#B85C38', display: 'inline-block', flexShrink: 0 }} />
                {u.status === 'active' ? 'Active' : 'Locked'}
              </span>

              <div className="text-right">
                {u.role !== 'admin' && (
                  u.status === 'active' ? (
                    <button onClick={() => mutation.mutate({ id: u.id, status: 'locked' })}
                      disabled={mutation.isPending}
                      className="text-[11px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 transition-colors disabled:opacity-50"
                      style={{ border: '1px solid #B85C38', color: '#B85C38', borderRadius: 4, backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B85C38'; e.currentTarget.style.color = '#FAF6EF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#B85C38'; }}
                    >
                      Lock
                    </button>
                  ) : (
                    <button onClick={() => mutation.mutate({ id: u.id, status: 'active' })}
                      disabled={mutation.isPending}
                      className="text-[11px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 transition-colors disabled:opacity-50"
                      style={{ border: '1px solid #2F4A3E', color: '#2F4A3E', borderRadius: 4, backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2F4A3E'; e.currentTarget.style.color = '#FAF6EF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2F4A3E'; }}
                    >
                      Unlock
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
