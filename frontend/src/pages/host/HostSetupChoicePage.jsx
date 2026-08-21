import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ChevronRightIcon, HomePlusIcon, LightbulbIcon } from '../../components/common/icons';
import logo from '../../assets/logo.png';

export default function HostSetupChoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName ? user.fullName.split(' ').pop() : 'Sang';

  return (
    <>
      <Seo title={t('host.setupChoice.pageTitle')} noindex />

      <div className="flex min-h-screen flex-col bg-white text-neutral-900">
        {/* Top Minimal Header (Matching Header.jsx layout) */}
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/host/today" className="shrink-0">
              <img src={logo} alt={t('common.brand')} className="h-10 w-auto sm:h-12" />
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast(t('host.setupChoice.supportToast'), { icon: <LightbulbIcon className="h-5 w-5 text-brand-600" /> })}
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                {t('host.setupChoice.support')}
              </button>
              <Link
                to="/host/listings"
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                {t('host.setupChoice.exit')}
              </Link>
            </div>
          </div>
        </header>

        {/* Full Page Main Content (Matching Screenshot 2026-08-10 145303.png) */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
          <div className="w-full space-y-8 animate-fadeIn">
            {/* Personalized Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
                {t('host.setupChoice.welcomeBack', { name: userName })}
              </h1>
            </div>

            {/* Bắt đầu tạo bài đăng mới */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900">
                {t('host.setupChoice.startNewHeading')}
              </h2>

              <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => navigate('/host/listings/new')}
                  className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <HomePlusIcon className="h-6 w-6 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
                    <span className="font-semibold text-neutral-900 text-base">{t('host.setupChoice.createNew')}</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
