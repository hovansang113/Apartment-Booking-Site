import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { updateBankInfo } from '../../services/authService';
import { ChevronLeftIcon } from '../../components/common/icons';

// UK sort code: 6 chu so, hien thi dang XX-XX-XX cho de doc (giong hau het
// form ngan hang UK that) - luu/gui len backend deu la 6 chu so thuan, chi
// format luc hien thi.
function formatSortCode(digits) {
  return digits.replace(/(\d{2})(?=\d)/g, '$1-');
}

function maskAccountNumber(num) {
  if (!num) return '';
  const last4 = num.slice(-4);
  return `•••• ${last4}`;
}

// Host "Payout information" - tai khoan ngan hang UK de nhan payout sau khi
// tru hoa hong nen tang (18/8, doi tu he thong VN sang UK theo yeu cau
// Jason - site chi phuc vu UK). Xem HostTaxSettingsPage.jsx cho phan thue/giay to.
export default function HostPayoutSettingsPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();

  const [bankSortCode, setBankSortCode] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  useEffect(() => {
    if (user) {
      setBankSortCode(user.bankSortCode || '');
      setBankAccountNumber(user.bankAccountNumber || '');
      setBankAccountHolder(user.bankAccountHolder || '');
    }
  }, [user]);

  const hasSavedBankInfo = Boolean(user?.bankAccountNumber);
  const showBankForm = !hasSavedBankInfo || editingBank;

  async function handleBankSubmit(e) {
    e.preventDefault();
    if (bankSortCode.length !== 6 || bankAccountNumber.length !== 8 || !bankAccountHolder.trim()) {
      toast.error(t('hostSettings.bankFillRequired'));
      return;
    }

    try {
      setSavingBank(true);
      const res = await updateBankInfo({
        bankSortCode,
        bankAccountNumber,
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
    setBankSortCode(user?.bankSortCode || '');
    setBankAccountNumber(user?.bankAccountNumber || '');
    setBankAccountHolder(user?.bankAccountHolder || '');
    setEditingBank(false);
  }

  return (
    <>
      <Seo title={t('hostSettings.bankPageTitle')} noindex />

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
                <p className="text-sm font-semibold text-neutral-900">{formatSortCode(user.bankSortCode)}</p>
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
              <div className="overflow-hidden rounded-2xl border border-neutral-200">
                <div className="p-5">
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                    {t('hostSettings.bankSortCodeLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatSortCode(bankSortCode)}
                    onChange={(e) => setBankSortCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('hostSettings.bankSortCodePlaceholder')}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="border-t border-neutral-200 p-5">
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                    {t('hostSettings.bankAccountNumberLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
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
