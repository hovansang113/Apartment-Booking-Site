import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { CalculatorIcon, BankIcon, ChevronRightIcon } from '../../components/common/icons';

const STATUS_CLASSNAME = {
  unverified: 'bg-neutral-100 text-neutral-600',
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

// Trang "hub" cai dat tai khoan host - liet ke tung muc rieng de bam vao, khop
// dung pattern trang Account settings that (Airbnb: Personal info/Payments &
// payouts/Taxes... deu la cac muc rieng, khong don het vao 1 trang dai). Tung
// muc co the mo rong sau nay (VD: bao mat, thong bao...) chi can them 1 item.
export default function HostSettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const taxStatusKey = user?.verificationStatus || 'unverified';
  const hasBankInfo = Boolean(user?.bankAccountNumber);

  const items = [
    {
      to: '/host/settings/tax',
      icon: CalculatorIcon,
      title: t('hostSettings.hub.taxItemTitle'),
      desc: t('hostSettings.hub.taxItemDesc'),
      badge: {
        text: t(`hostSettings.status.${taxStatusKey}`),
        className: STATUS_CLASSNAME[taxStatusKey],
      },
    },
    {
      to: '/host/settings/payout',
      icon: BankIcon,
      title: t('hostSettings.hub.payoutItemTitle'),
      desc: t('hostSettings.hub.payoutItemDesc'),
      badge: {
        text: hasBankInfo ? t('hostSettings.hub.payoutStatusSet') : t('hostSettings.hub.payoutStatusUnset'),
        className: hasBankInfo ? STATUS_CLASSNAME.verified : STATUS_CLASSNAME.unverified,
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('hostSettings.hub.pageTitle')}</title>
      </Helmet>

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('hostSettings.hub.heading')}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t('hostSettings.hub.subheading')}</p>
          </div>

          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 overflow-hidden">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-4 p-5 hover:bg-neutral-50 transition-colors"
              >
                <item.icon />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900">{item.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.badge.className}`}>
                      {item.badge.text}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-500">{item.desc}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-neutral-400" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
