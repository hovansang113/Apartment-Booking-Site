import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PlusIcon, GridViewIcon, ListViewIcon } from '../../components/common/icons';
import { getHostListings, deleteListing } from '../../services/listingService';
import { formatPrice } from '../../utils/currency';

const STATUS_BADGE_DOT = {
  pending: 'bg-blue-500',
  approved: 'bg-emerald-500',
  suspended: 'bg-red-500',
};

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function priceLabel(listing, t) {
  const weekday = Number(listing.weekdayPrice);
  const weekend = Number(listing.weekendPrice);
  const from = Math.min(weekday, weekend);
  return weekday !== weekend ? `${t('listing.priceFrom')} ${formatPrice(from)}` : formatPrice(from);
}

export default function HostListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['host-listings'],
    queryFn: getHostListings,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success(t('host.listings.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
    },
    onError: (err) => toast.error(errorMessage(err, t('host.listings.deleteErrorFallback'))),
  });

  function handleDelete(e, listing) {
    e.stopPropagation();
    if (window.confirm(t('host.listings.deleteConfirm', { title: listing.title }))) {
      deleteMutation.mutate(listing.id);
    }
  }

  const listings = data || [];

  return (
    <>
      <Seo title={t('host.listings.pageTitle')} noindex />

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header Title & Actions (Matching postPage.png) */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('host.listings.heading')}</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {t('host.listings.subheading')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center rounded-full border border-neutral-300 p-1 bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'grid' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-label={t('host.listings.gridView')}
                >
                  <GridViewIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'list' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-label={t('host.listings.listView')}
                >
                  <ListViewIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/host/listings/setup')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white hover:border-neutral-900 hover:bg-neutral-50 hover:shadow-md transition-all text-neutral-900"
                aria-label={t('host.listings.createNew')}
                title={t('host.listings.addNew')}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="py-16 text-center text-sm text-neutral-500">{t('host.listings.loading')}</p>
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <p className="text-sm font-medium text-red-700">{errorMessage(error, t('host.listings.loadErrorFallback'))}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
              <p className="text-sm font-medium text-neutral-700">{t('host.listings.empty')}</p>
              <p className="mt-1 text-sm text-neutral-500">{t('host.listings.emptyHint')}</p>
              <button
                type="button"
                onClick={() => navigate('/host/listings/setup')}
                className="mt-4 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                {t('host.listings.createNew')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group relative rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-400 transition-all flex flex-col"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                    <img
                      src={listing.images?.[0]?.thumbUrl || listing.images?.[0]?.imageUrl || 'https://placehold.co/800x600?text=No+image'}
                      alt={listing.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-semibold text-neutral-900 shadow-md">
                      <span className={`h-2 w-2 rounded-full ${STATUS_BADGE_DOT[listing.status]}`} />
                      <span>{t(`admin.listings.tabs.${listing.status}`, { defaultValue: listing.status })}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <Link
                        to={`/host/listings/${listing.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-md hover:bg-neutral-100"
                      >
                        {t('host.listings.edit')}
                      </Link>
                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={(e) => handleDelete(e, listing)}
                        className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-red-600 shadow-md hover:bg-red-50 disabled:opacity-50"
                      >
                        {t('host.listings.delete')}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-neutral-900 text-base line-clamp-2 leading-snug">
                        {listing.title}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-500">{listing.address}</p>
                      {listing.status === 'suspended' && listing.suspendReason && (
                        <p className="mt-2 text-xs text-red-600">
                          {t('admin.listings.suspendReasonLabel', { reason: listing.suspendReason })}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span>{t('host.listings.createdAt', { date: new Date(listing.createdAt).toLocaleDateString() })}</span>
                      <span className="font-bold text-neutral-900">
                        {priceLabel(listing, t)} {t('listing.perNight')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-900 hover:shadow-md transition-all"
                >
                  <img
                    src={listing.images?.[0]?.thumbUrl || listing.images?.[0]?.imageUrl || 'https://placehold.co/200x140?text=No+image'}
                    alt={listing.title}
                    className="h-20 w-28 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full ${STATUS_BADGE_DOT[listing.status]}`} />
                      <span className="text-xs font-semibold text-neutral-500">
                        {t(`admin.listings.tabs.${listing.status}`, { defaultValue: listing.status })}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-900 text-sm truncate">{listing.title}</h3>
                    <p className="text-xs text-neutral-500 truncate">{listing.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-neutral-900 text-sm">
                      {priceLabel(listing, t)} {t('listing.perNight')}
                    </span>
                  </div>
                  <Link
                    to={`/host/listings/${listing.id}/edit`}
                    className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-100"
                  >
                    {t('host.listings.edit')}
                  </Link>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => handleDelete(e, listing)}
                    className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {t('host.listings.delete')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
