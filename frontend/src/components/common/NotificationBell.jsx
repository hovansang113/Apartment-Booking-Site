import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markRead, markAllRead } from '../../services/notificationService';

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    refetchInterval: 30000,
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  const markOneMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors"
        aria-label="Thông báo"
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <span className="font-semibold text-sm text-neutral-800">Thông báo</span>
            {unread > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="text-xs text-teal-600 hover:underline disabled:opacity-50"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
            {notifications.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-400">Không có thông báo nào</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markOneMutation.mutate(n.id); }}
                  className={`px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors ${!n.isRead ? 'bg-teal-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                    )}
                    <div className={!n.isRead ? '' : 'ml-4'}>
                      <p className="text-sm font-medium text-neutral-800 leading-snug">{n.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{n.body}</p>
                      <p className="text-[11px] text-neutral-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
