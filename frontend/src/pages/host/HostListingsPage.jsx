import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  GridViewIcon,
  ListViewIcon,
  CalculatorIcon,
} from '../../components/common/icons';

const INITIAL_LISTINGS = [
  {
    id: 'draft-1',
    title: 'Nhà/phòng cho thuê thuộc loại hình Căn hộ của bạn đã được tạo vào 5 tháng 8, 2026',
    address: 'Nơi lưu trú tại Ngũ Hành Sơn, Việt Nam',
    status: 'in_progress',
    statusLabel: 'Đang thực hiện',
    statusColor: 'bg-amber-500 text-white',
    badgeDot: 'bg-amber-500',
    createdAt: '5 tháng 8, 2026',
    isDraft: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
  },
  {
    id: 'listing-1',
    title: 'Căn hộ Studio view biển Mỹ Khê sang trọng',
    address: 'Quận Sơn Trà, Đà Nẵng, Việt Nam',
    status: 'approved',
    statusLabel: 'Đã xuất bản',
    statusColor: 'bg-emerald-600 text-white',
    badgeDot: 'bg-emerald-500',
    createdAt: '1 tháng 8, 2026',
    price: '1.200.000 ₫ / đêm',
    isDraft: false,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
  },
  {
    id: 'listing-2',
    title: 'Villa biệt thự sân vườn phong cách Indochine',
    address: 'Hội An, Quảng Nam, Việt Nam',
    status: 'pending',
    statusLabel: 'Đang chờ duyệt',
    statusColor: 'bg-blue-600 text-white',
    badgeDot: 'bg-blue-500',
    createdAt: '7 tháng 8, 2026',
    price: '3.500.000 ₫ / đêm',
    isDraft: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  },
];

export default function HostListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showTaxNotice, setShowTaxNotice] = useState(true);

  return (
    <>
      <Helmet>
        <title>{t('host.listings.pageTitle')}</title>
      </Helmet>

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Top Notice Banner Card (Matching Screenshot) */}
          {showTaxNotice && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all sm:p-5">
              <button
                type="button"
                onClick={() => navigate('/host/settings/tax')}
                className="flex items-center gap-4 text-left hover:opacity-80 transition-opacity"
              >
                <CalculatorIcon />
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">
                    {t('host.taxNotice.title')}
                  </h2>
                  <p className="text-xs text-neutral-500 sm:text-sm">
                    {t('host.taxNotice.body')}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShowTaxNotice(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label={t('host.taxNotice.close')}
              >
                ✕
              </button>
            </div>
          )}

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

              {/* Plus (+) Button -> Navigates to full page /host/listings/setup (Matching Screenshot 2026-08-10 145303.png) */}
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

          {/* Listings Grid / List Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {INITIAL_LISTINGS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isDraft) navigate(`/host/listings/new?draftId=${item.id}&step=3`);
                  }}
                  className="group relative rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-400 transition-all cursor-pointer flex flex-col"
                >
                  {/* Image & Badge */}
                  <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-semibold text-neutral-900 shadow-md">
                      <span className={`h-2 w-2 rounded-full ${item.badgeDot}`} />
                      <span>{item.statusLabel}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-neutral-900 text-base line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-500">{item.address}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span>{t('host.listings.createdAt', { date: item.createdAt })}</span>
                      {item.price && <span className="font-bold text-neutral-900">{item.price}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {INITIAL_LISTINGS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isDraft) navigate(`/host/listings/new?draftId=${item.id}&step=3`);
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-900 hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-28 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full ${item.badgeDot}`} />
                      <span className="text-xs font-semibold text-neutral-500">{item.statusLabel}</span>
                    </div>
                    <h3 className="font-bold text-neutral-900 text-sm truncate">{item.title}</h3>
                    <p className="text-xs text-neutral-500 truncate">{item.address}</p>
                  </div>
                  {item.price && (
                    <div className="text-right shrink-0">
                      <span className="font-bold text-neutral-900 text-sm">{item.price}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
