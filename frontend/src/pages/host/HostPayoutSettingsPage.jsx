import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { updateBankInfo } from '../../services/authService';
import { VIETNAM_BANKS } from '../../data/vietnamBanks';
import { normalizeBankAccountHolder } from '../../utils/vietnameseText';
import { ChevronLeftIcon } from '../../components/common/icons';

function bankName(code) {
  return VIETNAM_BANKS.find((b) => b.code === code)?.name || code;
}

function maskAccountNumber(num) {
  if (!num) return '';
  const last4 = num.slice(-4);
  return `•••• ${last4}`;
}

// Host "Thong tin nhan tien" - tai khoan ngan hang de nhan payout sau khi
// tru hoa hong nen tang. Xem HostTaxSettingsPage.jsx cho phan thue/giay to.
export default function HostPayoutSettingsPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();

  const [bankCode, setBankCode] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  useEffect(() => {
    if (user) {
      setBankCode(user.bankCode || '');
      setBankAccountNumber(user.bankAccountNumber || '');
      setBankAccountHolder(user.bankAccountHolder || '');
    }
  }, [user]);

  const hasSavedBankInfo = Boolean(user?.bankAccountNumber);
  const showBankForm = !hasSavedBankInfo || editingBank;

  async function handleBankSubmit(e) {
    e.preventDefault();
    if (!bankCode || !bankAccountNumber.trim() || !bankAccountHolder.trim()) {
      toast.error(t('hostSettings.bankFillRequired'));
      return;
    }

    try {
      setSavingBank(true);
      const res = await updateBankInfo({
        bankCode,
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountHolder: bankAccountHolder.trim(),
      });
      login(res.user);
      setEditingBank(false);
      toast.success(t('hostSettings.bankSubmitSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('hostSettings.bankSubmitErrorFallback'));
    } finally {
      setSavingBank(false);
    }
  }

  function handleBankCancel() {
    setBankCode(user?.bankCode || '');
    setBankAccountNumber(user?.bankAccountNumber || '');
    setBankAccountHolder(user?.bankAccountHolder || '');
    setEditingBank(false);
  }

  return (
    <>
      <Helmet>
        <title>{t('hostSettings.bankPageTitle')}</title>
      </Helmet>

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link to="/host/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
            <ChevronLeftIcon className="h-4 w-4" />
            {t('hostSettings.hub.back')}
          </Link>

          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('hostSettings.bankSectionHeading')}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t('hostSettings.bankSectionSubheading')}</p>
          </div>

          {!showBankForm ? (
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900">{bankName(user.bankCode)}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {t('hostSettings.bankSummaryAccount', {
                    masked: maskAccountNumber(user.bankAccountNumber),
                    holder: user.bankAccountHolder,
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBank(true)}
                className="shrink-0 text-sm font-semibold text-brand-600 hover:underline"
              >
                {t('hostSettings.bankEdit')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 p-5">
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                  {t('hostSettings.bankLabel')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                >
                  <option value="">{t('hostSettings.bankPlaceholder')}</option>
                  {VIETNAM_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200">
                <div className="p-5">
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                    {t('hostSettings.bankAccountNumberLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('hostSettings.bankAccountNumberPlaceholder')}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="border-t border-neutral-200 p-5">
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                    {t('hostSettings.bankAccountHolderLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    placeholder={t('hostSettings.bankAccountHolderPlaceholder')}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                  <p className="mt-1.5 text-xs text-neutral-400">{t('hostSettings.bankAccountHolderHint')}</p>
                  {bankAccountHolder.trim() && (
                    <p className="mt-1 text-xs font-semibold text-neutral-600">
                      {t('hostSettings.bankAccountHolderPreview', { name: normalizeBankAccountHolder(bankAccountHolder) })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingBank}
                  className="flex-1 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  {savingBank ? t('hostSettings.bankSaving') : t('hostSettings.bankSave')}
                </button>
                {hasSavedBankInfo && (
                  <button
                    type="button"
                    onClick={handleBankCancel}
                    className="text-sm font-semibold text-neutral-500 hover:underline"
                  >
                    {t('hostSettings.bankCancel')}
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="mt-4 text-xs text-neutral-400 text-center">
            {t('hostSettings.bankDisclaimer')}
          </p>
        </div>
      </main>
    </>
  );
}
