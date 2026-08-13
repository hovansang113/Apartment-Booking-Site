import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import HostMonthGrid from '../../components/calendar/HostMonthGrid';
import DayEditModal from '../../components/calendar/DayEditModal';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/common/icons';
import { getHostListings } from '../../services/listingService';
import * as calendarService from '../../services/calendarService';

const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function ConnectCalendarSection({ listingId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSyncId, setEditingSyncId] = useState(null); // null = dang them moi; co gia tri = dang sua nguon nay
  const [icalUrl, setIcalUrl] = useState('');
  const [label, setLabel] = useState('');

  const sourcesQuery = useQuery({
    queryKey: ['calendar-sync', listingId],
    queryFn: () => calendarService.listSyncSources(listingId),
    enabled: Boolean(listingId),
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ['calendar-sync', listingId] });
    queryClient.invalidateQueries({ queryKey: ['calendar', listingId] });
  }

  function closeForm() {
    setShowForm(false);
    setEditingSyncId(null);
    setIcalUrl('');
    setLabel('');
  }

  const connectMutation = useMutation({
    mutationFn: () => calendarService.connectSyncSource(listingId, icalUrl.trim(), label.trim()),
    onSuccess: () => {
      toast.success('Đã kết nối và đồng bộ lịch ngoài');
      closeForm();
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, 'Không kết nối được — kiểm tra lại link .ics')),
  });

  const updateMutation = useMutation({
    mutationFn: () => calendarService.updateSyncSource(listingId, editingSyncId, { icalUrl: icalUrl.trim(), label: label.trim() }),
    onSuccess: () => {
      toast.success('Đã cập nhật lịch ngoài');
      closeForm();
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, 'Cập nhật thất bại')),
  });

  const refreshMutation = useMutation({
    mutationFn: (syncId) => calendarService.refreshSyncSource(listingId, syncId),
    onSuccess: () => {
      toast.success('Đã làm mới đồng bộ');
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, 'Làm mới thất bại')),
  });

  const removeMutation = useMutation({
    mutationFn: (syncId) => calendarService.removeSyncSource(listingId, syncId),
    onSuccess: () => {
      toast.success('Đã ngắt kết nối');
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, 'Không ngắt kết nối được')),
  });

  function openAddForm() {
    setEditingSyncId(null);
    setIcalUrl('');
    setLabel('');
    setShowForm(true);
  }

  function openEditForm(src) {
    setEditingSyncId(src.id);
    setIcalUrl(src.icalUrl);
    setLabel(src.label);
    setShowForm(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!icalUrl.trim() || !label.trim()) {
      toast.error('Nhập đủ tên hiển thị và link .ics');
      return;
    }
    if (editingSyncId) updateMutation.mutate();
    else connectMutation.mutate();
  }

  const sources = sourcesQuery.data || [];
  const isSaving = connectMutation.isPending || updateMutation.isPending;

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 p-5">
      <h2 className="text-base font-bold text-neutral-900 mb-1">Kết nối lịch ngoài</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Đồng bộ 2 chiều với Airbnb/VRBO qua link iCal (.ics) — ngày đã có khách trên hệ thống ngoài sẽ tự động bị
        chặn ở đây.
      </p>
      <div className="space-y-2">
        {sources.map((src) => (
          <div key={src.id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{src.label}</p>
              <p className="text-xs text-neutral-400">
                {src.lastSyncedAt
                  ? `Cập nhật lần cuối ${new Date(src.lastSyncedAt).toLocaleString('vi-VN')}`
                  : 'Chưa đồng bộ lần nào'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={refreshMutation.isPending}
                onClick={() => refreshMutation.mutate(src.id)}
                className="text-xs font-semibold text-brand-700 hover:underline disabled:opacity-50"
              >
                Làm mới
              </button>
              <button
                type="button"
                onClick={() => openEditForm(src)}
                className="text-xs font-semibold text-neutral-700 hover:underline"
              >
                Sửa
              </button>
              <button
                type="button"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(src.id)}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                Ngắt kết nối
              </button>
            </div>
          </div>
        ))}

        {showForm ? (
          <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-300 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase text-neutral-400">
              {editingSyncId ? 'Sửa lịch đã kết nối' : 'Kết nối lịch mới'}
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">Tên hiển thị</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="VD: Airbnb - clean and cosy"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">Link lịch (.ics)</label>
              <input
                type="text"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/....ics?t=..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : editingSyncId ? 'Lưu thay đổi' : 'Kết nối'}
              </button>
              <button type="button" onClick={closeForm} className="text-xs font-semibold text-neutral-500 hover:underline">
                Huỷ
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={openAddForm}
            className="w-full rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
          >
            Kết nối thêm lịch khác
          </button>
        )}
      </div>
    </div>
  );
}

export default function HostCalendarPage() {
  const queryClient = useQueryClient();
  const today = new Date();
  const [listingId, setListingId] = useState('');
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [editingDay, setEditingDay] = useState(null);
  const todayYMD = toYMD(today);
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1; // API la 1-indexed

  const listingsQuery = useQuery({ queryKey: ['host-listings'], queryFn: getHostListings });
  const listings = listingsQuery.data || [];
  const activeListingId = listingId || listings[0]?.id || '';

  const monthQuery = useQuery({
    queryKey: ['calendar', activeListingId, year, month],
    queryFn: () => calendarService.getMonthView(activeListingId, year, month),
    enabled: Boolean(activeListingId),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ date, status, price, note, previousPrice }) => {
      if (status === 'blocked') {
        await calendarService.blockDates(activeListingId, [date], note);
      } else {
        await calendarService.unblockDates(activeListingId, [date]);
      }
      if (price !== previousPrice) {
        await calendarService.setPriceOverride(activeListingId, date, price);
      }
    },
    onSuccess: (_, { status }) => {
      toast.success(status === 'blocked' ? 'Đã chặn ngày này' : 'Đã cập nhật ngày này');
      queryClient.invalidateQueries({ queryKey: ['calendar', activeListingId, year, month] });
    },
    onError: (err) => toast.error(errorMessage(err, 'Có lỗi xảy ra, thử lại sau')),
  });

  function handleSaveDay({ date, status, price, note }) {
    saveMutation.mutate({ date, status, price, note, previousPrice: editingDay.price });
  }

  const monthData = monthQuery.data;

  return (
    <>
      <Helmet>
        <title>Lịch cho thuê — Stayhub Host</title>
      </Helmet>

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Lịch cho thuê</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Xem lượt đặt, đặt giá theo ngày, chặn ngày thủ công và đồng bộ với lịch ngoài (REQ_12).
            </p>
          </div>

          {listingsQuery.isLoading ? (
            <p className="text-sm text-neutral-500">Đang tải danh sách bài đăng...</p>
          ) : listingsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <p className="text-sm font-medium text-red-700">
                {errorMessage(listingsQuery.error, 'Không tải được danh sách bài đăng')}
              </p>
              <p className="mt-1 text-sm text-red-500">Cần đăng nhập bằng tài khoản chủ nhà để xem trang này.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
              <p className="text-sm font-medium text-neutral-700">Bạn chưa có bài đăng nào để quản lý lịch.</p>
              <p className="mt-1 text-sm text-neutral-500">Hoàn tất đăng 1 bài trước, rồi quay lại đây.</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">Bài đăng</label>
                <select
                  value={activeListingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="w-full max-w-sm rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-900"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 transition-colors"
                    aria-label="Tháng trước"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <p className="text-base font-semibold text-neutral-900">
                    {MONTHS_VI[cursor.getMonth()]} {cursor.getFullYear()}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 transition-colors"
                    aria-label="Tháng sau"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-5 text-xs text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-white border border-neutral-200 inline-block" />
                    Còn trống
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-brand-600 inline-block" />
                    Đã có khách
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-indigo-500 inline-block" />
                    Đồng bộ ngoài
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-neutral-100 border border-neutral-300 inline-block" />
                    Đã chặn
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded ring-2 ring-brand-500 inline-block" />
                    Hôm nay
                  </span>
                </div>

                {monthQuery.isLoading ? (
                  <p className="py-10 text-center text-sm text-neutral-500">Đang tải lịch...</p>
                ) : monthQuery.isError ? (
                  <p className="py-10 text-center text-sm text-red-600">
                    {errorMessage(monthQuery.error, 'Không tải được lịch, thử lại sau')}
                  </p>
                ) : (
                  <HostMonthGrid
                    year={year}
                    month={month - 1}
                    days={monthData.days}
                    todayYMD={todayYMD}
                    onDayClick={setEditingDay}
                  />
                )}
              </div>

              <ConnectCalendarSection listingId={activeListingId} />
            </>
          )}
        </div>
      </main>

      {editingDay && monthData && (
        <DayEditModal
          day={editingDay}
          defaultPrice={monthData.defaultPrice}
          onClose={() => setEditingDay(null)}
          onSave={handleSaveDay}
        />
      )}
    </>
  );
}
