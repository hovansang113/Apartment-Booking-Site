import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import { useTranslation } from 'react-i18next';
import { BookIllustration, CalculatorIcon } from '../../components/common/icons';

export default function HostTodayPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming'
  const [showTaxNotice, setShowTaxNotice] = useState(true);

  // Flag checking if host has any unfinished draft listing
  const [hasDraftListing, setHasDraftListing] = useState(true);

  return (
    <>
      <Seo title={t('host.today.pageTitle')} noindex />

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Top Banner Notice Card */}
          {showTaxNotice && (
            <div className="mb-10 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all sm:p-5">
              <Link to="/host/settings/tax" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <CalculatorIcon />
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">
                    {t('host.taxNotice.title')}
                  </h2>
                  <p className="text-xs text-neutral-500 sm:text-sm">
                    {t('host.taxNotice.body')}
                  </p>
                </div>
              </Link>
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

          {/* Sub-tabs Capsule Selectors */}
          <div className="mb-12 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('host.today.tabToday')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t('host.today.tabUpcoming')}
            </button>
          </div>

          {/* Empty State Section */}
          <div className="flex flex-col items-center justify-center text-center py-6">
            <BookIllustration className="h-32 w-32 sm:h-36 sm:w-36 mb-6" />

            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              {t('host.today.emptyTitle')}
            </h1>

            <p className="mt-3 text-sm text-neutral-500 sm:text-base max-w-md">
              {hasDraftListing
                ? t('host.today.emptyBodyDraft')
                : t('host.today.emptyBodyNoDraft')}
            </p>

            {/* Render "Hoàn tất bài đăng của bạn" ONLY IF hasDraftListing is true, else render "Tạo bài đăng mới" */}
            {hasDraftListing ? (
              <Link
                to="/host/listings/setup"
                className="mt-8 rounded-2xl bg-neutral-100 px-6 py-3.5 text-sm font-semibold text-neutral-900 border border-neutral-300 hover:bg-neutral-200 hover:border-neutral-400 transition-colors shadow-sm"
              >
                {t('host.today.finishListing')}
              </Link>
            ) : (
              <Link
                to="/host/listings/setup"
                className="mt-8 rounded-2xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                {t('host.today.createListing')}
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
