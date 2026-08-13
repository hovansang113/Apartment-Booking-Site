import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getHostListings } from '../../services/listingService';
import { getPriceOverrides, setPriceOverrides, deletePriceOverride } from '../../services/pricingService';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function toDateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const vnd = (n) => Number(n).toLocaleString('vi-VN') + 'đ';

export default function HostPricingPage() {
  const qc = useQueryClient();
  const today = new Date();

  const [listingId, setListingId] = useState('');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selected, setSelected] = useState(new Set());
  const [priceInput, setPriceInput] = useState('');

  const { data: listings = [] } = useQuery({
    queryKey: ['host-listings'],
    queryFn: getHostListings,
  });

  const selectedListing = listings.find((l) => l.id === listingId);

  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['price-overrides', listingId, year, month],
    queryFn: () => getPriceOverrides(listingId, year, month),
    enabled: Boolean(listingId),
  });

  const overrideMap = Object.fromEntries(
    overrides.map((o) => [o.date.split('T')[0], Number(o.price)])
  );

  const setMutation = useMutation({
    mutationFn: (overridesList) => setPriceOverrides(listingId, overridesList),
    onSuccess: () => {
      toast.success('Đã cập nhật giá');
      setSelected(new Set());
      setPriceInput('');
      qc.invalidateQueries({ queryKey: ['price-overrides', listingId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (date) => deletePriceOverride(listingId, date),
    onSuccess: () => {
      toast.success('Đã xoá giá tuỳ chỉnh');
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['price-overrides', listingId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  function toggleDay(dateStr) {
    const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
    if (dateStr < todayStr) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  }

  function handleApplyPrice() {
    const price = Number(priceInput);
    if (!price || price <= 0) return toast.error('Nhập giá hợp lệ');
    if (selected.size === 0) return toast.error('Chọn ít nhất 1 ngày');
    const overridesList = [...selected].map((date) => ({ date, price }));
    setMutation.mutate(overridesList);
  }

  function handleResetSelected() {
    const selectedArr = [...selected];
    if (selectedArr.length !== 1) return toast.error('Chỉ xoá từng ngày một');
    const date = selectedArr[0];
    if (!overrideMap[date]) return toast.error('Ngày này chưa có giá tuỳ chỉnh');
    deleteMutation.mutate(date);
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const monthLabel = new Date(year, month - 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const selectedHasOverride = [...selected].some((d) => overrideMap[d] != null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Quản lý giá</h1>

        <select
          value={listingId}
          onChange={(e) => { setListingId(e.target.value); setSelected(new Set()); setPriceInput(''); }}
          className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">-- Chọn listing --</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>

        {!listingId ? (
          <p className="py-16 text-center text-gray-400">Chọn listing để quản lý giá</p>
        ) : (
          <>
            {selectedListing && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                Giá mặc định: <span className="font-semibold text-gray-900">{vnd(selectedListing.defaultPrice)}</span> / đêm
                <span className="ml-2 text-gray-400 text-xs">(ngày không có giá tuỳ chỉnh sẽ dùng giá này)</span>
              </div>
            )}

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
                    <div key={`e-${i}`} className="border-r border-b border-gray-50 p-1 h-16" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dateStr = toDateStr(year, month, day);
                    const isPast = dateStr < todayStr;
                    const isSelected = selected.has(dateStr);
                    const overridePrice = overrideMap[dateStr];

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => toggleDay(dateStr)}
                        className={`relative h-16 border-r border-b border-gray-50 p-1 text-left text-sm transition-colors
                          ${isPast ? 'opacity-30 cursor-default' : 'hover:bg-gray-50 cursor-pointer'}
                          ${isSelected ? 'ring-2 ring-inset ring-teal-500 bg-teal-50' : ''}
                        `}
                      >
                        <span className="text-xs text-gray-700">{day}</span>
                        {overridePrice != null ? (
                          <span className="mt-0.5 block truncate rounded bg-amber-100 px-1 text-[10px] text-amber-800 font-semibold">
                            {vnd(overridePrice)}
                          </span>
                        ) : (
                          <span className="mt-0.5 block truncate text-[10px] text-gray-300">
                            mặc định
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
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-800">
                    Đã chọn <strong>{selected.size}</strong> ngày
                  </span>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Nhập giá (VND)"
                    min="0"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleApplyPrice}
                    disabled={setMutation.isPending}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
                  >
                    Áp dụng
                  </button>
                  {selectedHasOverride && selected.size === 1 && (
                    <button
                      onClick={handleResetSelected}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Xoá giá
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chú thích */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-100" /> Giá tuỳ chỉnh
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
