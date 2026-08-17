import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { updateTaxInfo } from '../../services/authService';
import { ChevronLeftIcon } from '../../components/common/icons';

const TAXPAYER_TYPE_VALUES = ['individual', 'household_business', 'company'];

const STATUS_CLASSNAME = {
  unverified: 'bg-neutral-100 text-neutral-600',
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

// "Settings" giay to/thue cho host - mo phong theo cach Airbnb thu thap thong
// tin thue that (Form W-9: ten phap ly, dia chi, tax ID, tax classification).
// KHONG phai tu van phap ly/thue Viet Nam chinh thuc - chi la UI mo phong cho
// du an hoc tap. Chua co man hinh admin duyet that (REQ_03) nen trang thai se
// giu o "pending" sau khi nop.
export default function HostTaxSettingsPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxpayerType, setTaxpayerType] = useState('individual');
  const [idNumber, setIdNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // AuthContext nap user bat dong bo (goi getMe() luc mount), nen o lan render
  // dau user van con null - phai dong bo lai form bang useEffect thay vi chi
  // dua vao gia tri khoi tao cua useState (chi chay 1 lan, khong tu cap nhat
  // khi user den sau).
  useEffect(() => {
    if (user) {
      setLegalName(user.legalName || '');
      setTaxId(user.taxId || '');
      setTaxpayerType(user.taxpayerType || 'individual');
      setIdNumber(user.idNumber || '');
    }
  }, [user]);

  const statusKey = user?.verificationStatus || 'unverified';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!legalName.trim() || !taxId.trim()) {
      toast.error(t('hostSettings.fillRequired'));
      return;
    }

    try {
      setSaving(true);
      const res = await updateTaxInfo({ legalName: legalName.trim(), taxId: taxId.trim(), taxpayerType, idNumber: idNumber.trim() });
      login(res.user);
      toast.success(t('hostSettings.submitSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('hostSettings.submitErrorFallback'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Seo title={t('hostSettings.pageTitle')} noindex />

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link to="/host/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
            <ChevronLeftIcon className="h-4 w-4" />
            {t('hostSettings.hub.back')}
          </Link>

          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('hostSettings.heading')}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {t('hostSettings.subheading')}
            </p>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-neutral-500">{t('hostSettings.verificationStatus')}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSNAME[statusKey]}`}>
              {t(`hostSettings.status.${statusKey}`)}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                {t('hostSettings.legalNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder={t('hostSettings.legalNamePlaceholder')}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                {t('hostSettings.taxIdLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={t('hostSettings.taxIdPlaceholder')}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
              <p className="mt-1.5 text-xs text-neutral-400">{t('hostSettings.taxIdHint')}</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-3">{t('hostSettings.taxpayerTypeLabel')}</label>
              <div className="space-y-2">
                {TAXPAYER_TYPE_VALUES.map((value) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      taxpayerType === value ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="taxpayerType"
                      value={value}
                      checked={taxpayerType === value}
                      onChange={(e) => setTaxpayerType(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{t(`hostSettings.taxpayerTypes.${value}.label`)}</p>
                      <p className="text-xs text-neutral-500">{t(`hostSettings.taxpayerTypes.${value}.desc`)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">{t('hostSettings.idNumberLabel')}</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={t('hostSettings.idNumberPlaceholder')}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {saving ? t('hostSettings.saving') : t('hostSettings.save')}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              {t('hostSettings.disclaimer')}
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
