import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getHostListings } from '../../services/listingService';
import { getCalendar, blockDates, unblockDates } from '../../services/calendarService';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const STATUS_STYLE = {
  booked: 'bg-teal-100 text-teal-800 font-semibold',
  blocked: 'bg-red-100 text-red-700 line-through',
};

function toDateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function HostCalendarPage() {
  const qc = useQueryClient();
  const today = new Date();
  const [listingId, setListingId] = useState('');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selected, setSelected] = useState(new Set());

  const { data: listings = [] } = useQuery({
    queryKey: ['host-listings'],
    queryFn: getHostListings,
  });

  const { data: calendarDays = [], isLoading } = useQuery({
    queryKey: ['calendar', listingId, year, month],
    queryFn: () => getCalendar(listingId, year, month),
    enabled: Boolean(listingId),
  });

  const dayMap = Object.fromEntries(
    calendarDays.map((d) => [d.date.split('T')[0], d])
  );

  const blockMutation = useMutation({
    mutationFn: (dates) => blockDates(listingId, dates),
    onSuccess: () => {
      toast.success('Đã khoá ngày');
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['calendar', listingId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const unblockMutation = useMutation({
    mutationFn: (dates) => unblockDates(listingId, dates),
    onSuccess: () => {
      toast.success('Đã mở khoá ngày');
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['calendar', listingId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function toggleDay(dateStr, status) {
    if (status === 'booked') return; // không thể toggle ngày đã booking
    setSelected(prev => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const monthLabel = new Date(year, month - 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const selectedArr = [...selected];
  const allBlocked = selectedArr.length > 0 && selectedArr.every(d => dayMap[d]?.status === 'blocked');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Lịch cho thuê</h1>

        {/* Chọn listing */}
        <select
          value={listingId}
          onChange={(e) => { setListingId(e.target.value); setSelected(new Set()); }}
          className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">-- Chọn listing --</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>

        {!listingId ? (
          <p className="py-16 text-center text-gray-400">Chọn listing để xem lịch</p>
        ) : (
          <>
            {/* Navigation tháng */}
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-gray-200 transition-colors">←</button>
              <span className="font-semibold text-gray-800 capitalize">{monthLabel}</span>
              <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-gray-200 transition-colors">→</button>
            </div>

            {/* Grid lịch */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
                ))}
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-gray-400">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} className="border-r border-b border-gray-50 p-1 h-14" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dateStr = toDateStr(year, month, day);
                    const info = dayMap[dateStr];
                    const status = info?.status;
                    const isPast = dateStr < todayStr;
                    const isSelected = selected.has(dateStr);

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast || status === 'booked'}
                        onClick={() => toggleDay(dateStr, status)}
                        className={`relative h-14 border-r border-b border-gray-50 p-1 text-left text-sm transition-colors
                          ${isPast ? 'opacity-30 cursor-default' : 'hover:bg-gray-50'}
                          ${isSelected ? 'ring-2 ring-inset ring-teal-500' : ''}
                          ${status === 'booked' ? 'cursor-default' : ''}
                        `}
                      >
                        <span className="text-xs text-gray-700">{day}</span>
                        {status && (
                          <span className={`mt-0.5 block truncate rounded px-1 text-[10px] ${STATUS_STYLE[status]}`}>
                            {status === 'booked' ? 'Đã đặt' : 'Đã khoá'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action bar */}
            {selected.size > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
                <span className="text-sm text-teal-800">
                  Đã chọn <strong>{selected.size}</strong> ngày
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(new Set())}
                    className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Bỏ chọn
                  </button>
                  {allBlocked ? (
                    <button
                      onClick={() => unblockMutation.mutate(selectedArr)}
                      disabled={unblockMutation.isPending}
                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      Mở khoá
                    </button>
                  ) : (
                    <button
                      onClick={() => blockMutation.mutate(selectedArr)}
                      disabled={blockMutation.isPending}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Khoá ngày
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chú thích */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-teal-100" /> Đã đặt
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-red-100" /> Đã khoá
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border-2 border-teal-500" /> Đang chọn
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
