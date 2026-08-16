import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';
import { verifyReturn } from '../../services/paymentService';

// Phase 4 - khach duoc VNPay redirect ve day sau khi thanh toan xong. Doc
// nguyen query string (vnp_*) tu URL roi forward cho backend verify chu ky +
// cap nhat trang thai that (payment.service.js#confirmPayment) - trang nay
// KHONG tu quyet dinh thanh cong/that bai tu query string, chi hien lai ket
// qua backend tra ve (tranh bi gia mao URL de gia vo thanh cong).
export default function VnpayReturnPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: true, result: null, failed: false });

  useEffect(() => {
    const search = window.location.search;
    if (!search) {
      setState({ loading: false, result: null, failed: true });
      return;
    }
    verifyReturn(search)
      .then((result) => setState({ loading: false, result, failed: false }))
      .catch(() => setState({ loading: false, result: null, failed: true }));
  }, []);

  if (state.loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-neutral-500">{t('payment.verifying')}</div>
    );
  }

  const resolvedCode = state.result?.code === 'ok' || state.result?.code === 'already_processed';
  let status = 'error';
  if (!state.failed && resolvedCode) {
    status = state.result.paymentStatus === 'success' ? 'success' : 'failed';
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Seo title={t('payment.returnPageTitle')} noindex />

      {status === 'success' && (
        <>
          <p className="text-4xl">✅</p>
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">{t('payment.returnSuccessHeading')}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t('payment.returnSuccessBody')}</p>
          {state.result.booking?.bookingCode && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase text-neutral-500">{t('listing.booking.bookingCodeLabel')}</p>
              <p className="mt-1 text-xl font-bold tracking-widest text-neutral-900">{state.result.booking.bookingCode}</p>
            </div>
          )}
        </>
      )}

      {status === 'failed' && (
        <>
          <p className="text-4xl">❌</p>
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">{t('payment.returnFailedHeading')}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t('payment.returnFailedBody')}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">{t('payment.returnErrorHeading')}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t('payment.returnErrorBody')}</p>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {t('payment.backHome')}
      </button>
    </div>
  );
}
