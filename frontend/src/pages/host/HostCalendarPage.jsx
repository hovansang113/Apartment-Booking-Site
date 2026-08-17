import { useState } from 'react';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import HostMonthGrid from '../../components/calendar/HostMonthGrid';
import DayEditModal from '../../components/calendar/DayEditModal';
import BulkDayEditModal from '../../components/calendar/BulkDayEditModal';
import BookingDetailModal from '../../components/calendar/BookingDetailModal';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/common/icons';
import { getHostListings } from '../../services/listingService';
import * as calendarService from '../../services/calendarService';

const DATE_FNS_LOCALES = { vi, en: enUS };

function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function ConnectCalendarSection({ listing }) {
  const { t, i18n } = useTranslation();
  const dateFnsLocale = DATE_FNS_LOCALES[i18n.language] || vi;
  const listingId = listing.id;
  const exportUrl = `${API_BASE}/calendar/${listing.id}/export.ics?t=${listing.icalToken}`;
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
      toast.success(t('hostCalendar.connect.connectSuccess'));
      closeForm();
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, t('hostCalendar.connect.connectErrorFallback'))),
  });

  const updateMutation = useMutation({
    mutationFn: () => calendarService.updateSyncSource(listingId, editingSyncId, { icalUrl: icalUrl.trim(), label: label.trim() }),
    onSuccess: () => {
      toast.success(t('hostCalendar.connect.updateSuccess'));
      closeForm();
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, t('hostCalendar.connect.updateErrorFallback'))),
  });

  const refreshMutation = useMutation({
    mutationFn: (syncId) => calendarService.refreshSyncSource(listingId, syncId),
    onSuccess: () => {
      toast.success(t('hostCalendar.connect.refreshSuccess'));
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, t('hostCalendar.connect.refreshErrorFallback'))),
  });

  const removeMutation = useMutation({
    mutationFn: (syncId) => calendarService.removeSyncSource(listingId, syncId),
    onSuccess: () => {
      toast.success(t('hostCalendar.connect.disconnectSuccess'));
      invalidateAll();
    },
    onError: (err) => toast.error(errorMessage(err, t('hostCalendar.connect.disconnectErrorFallback'))),
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
      toast.error(t('hostCalendar.connect.fillRequired'));
      return;
    }
    if (editingSyncId) updateMutation.mutate();
    else connectMutation.mutate();
  }

  const sources = sourcesQuery.data || [];
  const isSaving = connectMutation.isPending || updateMutation.isPending;

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 p-5">
      <h2 className="text-base font-bold text-neutral-900 mb-1">{t('hostCalendar.connect.heading')}</h2>
      <p className="text-sm text-neutral-500 mb-4">
        {t('hostCalendar.connect.description')}
      </p>

      <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">{t('hostCalendar.connect.step1Label')}</p>
        <p className="text-xs text-neutral-500 mb-2">
          {t('hostCalendar.connect.step1Desc')}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={exportUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 truncate rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-600 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(exportUrl);
              toast.success(t('hostCalendar.connect.copied'));
            }}
            className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            {t('hostCalendar.connect.copy')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sources.map((src) => (
          <div key={src.id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{src.label}</p>
              <p className="text-xs text-neutral-400">
                {src.lastSyncedAt
                  ? t('hostCalendar.connect.lastSynced', { date: new Date(src.lastSyncedAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN') })
                  : t('hostCalendar.connect.neverSynced')}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={refreshMutation.isPending}
                onClick={() => refreshMutation.mutate(src.id)}
                className="text-xs font-semibold text-brand-700 hover:underline disabled:opacity-50"
              >
                {t('hostCalendar.connect.refresh')}
              </button>
              <button
                type="button"
                onClick={() => openEditForm(src)}
                className="text-xs font-semibold text-neutral-700 hover:underline"
              >
                {t('hostCalendar.connect.edit')}
              </button>
              <button
                type="button"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(src.id)}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                {t('hostCalendar.connect.disconnect')}
              </button>
            </div>
          </div>
        ))}

        {showForm ? (
          <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-300 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase text-neutral-400">
              {editingSyncId ? t('hostCalendar.connect.editHeading') : t('hostCalendar.connect.newHeading')}
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">{t('hostCalendar.connect.displayNameLabel')}</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t('hostCalendar.connect.displayNamePlaceholder')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">{t('hostCalendar.connect.icalUrlLabel')}</label>
              <input
                type="text"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder={t('hostCalendar.connect.icalUrlPlaceholder')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSaving ? t('hostCalendar.connect.saving') : editingSyncId ? t('hostCalendar.connect.saveChanges') : t('hostCalendar.connect.connectBtn')}
              </button>
              <button type="button" onClick={closeForm} className="text-xs font-semibold text-neutral-500 hover:underline">
                {t('hostCalendar.connect.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={openAddForm}
            className="w-full rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
          >
            {t('hostCalendar.connect.connectMore')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function HostCalendarPage() {
  const { t, i18n } = useTranslation();
  const dateFnsLocale = DATE_FNS_LOCALES[i18n.language] || vi;
  const queryClient = useQueryClient();
  const today = new Date();
  const [listingId, setListingId] = useState('');
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [editingDay, setEditingDay] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [editingBulk, setEditingBulk] = useState(false);
  const todayYMD = toYMD(today);
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1; // API la 1-indexed

  const listingsQuery = useQuery({ queryKey: ['host-listings'], queryFn: getHostListings });
  const listings = listingsQuery.data || [];
  const activeListingId = listingId || listings[0]?.id || '';
  const activeListing = listings.find((l) => l.id === activeListingId);

  const monthQuery = useQuery({
    queryKey: ['calendar', activeListingId, year, month],
    queryFn: () => calendarService.getMonthView(activeListingId, year, month),
    enabled: Boolean(activeListingId),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ date, status, price, note, minNights, maxNights, previousPrice, previousMinNights, previousMaxNights }) => {
      if (status === 'blocked') {
        await calendarService.blockDates(activeListingId, [date], note);
      } else {
        await calendarService.unblockDates(activeListingId, [date]);
      }
      if (price !== previousPrice) {
        await calendarService.setPriceOverride(activeListingId, date, price);
      }
      if (minNights !== previousMinNights || maxNights !== previousMaxNights) {
        await calendarService.setStayRule(activeListingId, date, minNights, maxNights);
      }
    },
    onSuccess: (_, { status }) => {
      toast.success(status === 'blocked' ? t('hostCalendar.page.saveBlocked') : t('hostCalendar.page.saveUpdated'));
      queryClient.invalidateQueries({ queryKey: ['calendar', activeListingId, year, month] });
    },
    onError: (err) => toast.error(errorMessage(err, t('hostCalendar.page.saveErrorFallback'))),
  });

  function handleSaveDay({ date, status, price, note, minNights, maxNights }) {
    saveMutation.mutate({
      date,
      status,
      price,
      note,
      minNights,
      maxNights,
      previousPrice: editingDay.price,
      previousMinNights: editingDay.minNights,
      previousMaxNights: editingDay.maxNights,
    });
  }

  function toggleDate(ymd) {
    setSelectedDates((prev) => (prev.includes(ymd) ? prev.filter((d) => d !== ymd) : [...prev, ymd].sort()));
  }

  function resetSelection() {
    setMultiSelectMode(false);
    setSelectedDates([]);
    setEditingBulk(false);
  }

  // Chi chan/mo khoa + ghi chu chung cho ca khoang - KHONG dong gia rieng
  // tung ngay (phan biet gia ngay thuong/cuoi tuan van giu nguyen, chinh tung
  // ngay nhu binh thuong). Tai dung dung API block/unblock da co san
  // (calendarService da nhan mang ngay tu truoc, khong can sua backend).
  const bulkSaveMutation = useMutation({
    mutationFn: async ({ dates, status, note }) => {
      if (status === 'blocked') await calendarService.blockDates(activeListingId, dates, note);
      else await calendarService.unblockDates(activeListingId, dates);
    },
    onSuccess: (_, { dates }) => {
      toast.success(t('hostCalendar.page.bulkSaveSuccess', { count: dates.length }));
      queryClient.invalidateQueries({ queryKey: ['calendar', activeListingId, year, month] });
      resetSelection();
    },
    onError: (err) => toast.error(errorMessage(err, t('hostCalendar.page.saveErrorFallback'))),
  });

  const monthData = monthQuery.data;

  return (
    <>
      <Seo title={t('hostCalendar.page.pageTitle')} noindex />

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('hostCalendar.page.heading')}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {t('hostCalendar.page.subheading')}
            </p>
          </div>

          {listingsQuery.isLoading ? (
            <p className="text-sm text-neutral-500">{t('hostCalendar.page.loadingListings')}</p>
          ) : listingsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <p className="text-sm font-medium text-red-700">
                {errorMessage(listingsQuery.error, t('hostCalendar.page.loadListingsErrorFallback'))}
              </p>
              <p className="mt-1 text-sm text-red-500">{t('hostCalendar.page.loadListingsErrorHint')}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
              <p className="text-sm font-medium text-neutral-700">{t('hostCalendar.page.noListings')}</p>
              <p className="mt-1 text-sm text-neutral-500">{t('hostCalendar.page.noListingsHint')}</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">{t('hostCalendar.page.listingLabel')}</label>
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
                    aria-label={t('dateRangePicker.prevMonth')}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <p className="text-base font-semibold text-neutral-900 capitalize">
                    {format(cursor, 'LLLL yyyy', { locale: dateFnsLocale })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 transition-colors"
                    aria-label={t('dateRangePicker.nextMonth')}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-5 text-xs text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-white border border-neutral-200 inline-block" />
                    {t('hostCalendar.legend.available')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-brand-600 inline-block" />
                    {t('hostCalendar.legend.booked')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-indigo-500 inline-block" />
                    {t('hostCalendar.legend.syncedExternal')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-neutral-100 border border-neutral-300 inline-block" />
                    {t('hostCalendar.legend.blocked')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded ring-2 ring-brand-500 inline-block" />
                    {t('hostCalendar.legend.today')}
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  {multiSelectMode ? (
                    <>
                      <p className="text-sm font-medium text-neutral-700">
                        {selectedDates.length > 0
                          ? t('hostCalendar.page.selectedCount', { count: selectedDates.length })
                          : t('hostCalendar.page.selectMultipleHint')}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingBulk(true)}
                          disabled={selectedDates.length === 0}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
                        >
                          {t('hostCalendar.page.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={resetSelection}
                          className="text-xs font-semibold text-neutral-500 hover:underline"
                        >
                          {t('hostCalendar.page.cancelSelection')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMultiSelectMode(true)}
                      className="ml-auto rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                    >
                      {t('hostCalendar.page.selectMultiple')}
                    </button>
                  )}
                </div>

                {monthQuery.isLoading ? (
                  <p className="py-10 text-center text-sm text-neutral-500">{t('hostCalendar.page.loadingCalendar')}</p>
                ) : monthQuery.isError ? (
                  <p className="py-10 text-center text-sm text-red-600">
                    {errorMessage(monthQuery.error, t('hostCalendar.page.loadCalendarErrorFallback'))}
                  </p>
                ) : (
                  <HostMonthGrid
                    year={year}
                    month={month - 1}
                    days={monthData.days}
                    todayYMD={todayYMD}
                    onDayClick={setEditingDay}
                    onBookingClick={setViewingBooking}
                    multiSelectMode={multiSelectMode}
                    selectedDates={selectedDates}
                    onToggleDate={toggleDate}
                  />
                )}
              </div>

              {activeListing && <ConnectCalendarSection listing={activeListing} />}
            </>
          )}
        </div>
      </main>

      {editingDay && monthData && (
        <DayEditModal
          day={editingDay}
          basePrice={editingDay.basePrice}
          onClose={() => setEditingDay(null)}
          onSave={handleSaveDay}
        />
      )}

      {editingBulk && (
        <BulkDayEditModal
          dates={selectedDates}
          onClose={() => setEditingBulk(false)}
          onSave={({ dates, status, note }) => bulkSaveMutation.mutateAsync({ dates, status, note })}
        />
      )}

      {viewingBooking && (
        <BookingDetailModal
          booking={viewingBooking.booking}
          guestName={viewingBooking.guestName}
          onClose={() => setViewingBooking(null)}
        />
      )}
    </>
  );
}
