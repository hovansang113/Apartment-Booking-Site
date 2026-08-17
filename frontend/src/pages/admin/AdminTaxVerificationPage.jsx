import { useState } from 'react';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { CloseIcon } from '../../components/common/icons';
import * as adminService from '../../services/adminService';

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function RejectModal({ onClose, onConfirm }) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(note.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-neutral-900">{t('admin.tax.rejectModalTitle')}</h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-700" aria-label={t('admin.reasonModal.close')}>
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={t('admin.tax.rejectPlaceholder')}
          className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="button"
          disabled={!note.trim() || submitting}
          onClick={handleConfirm}
          className="mt-3 w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? t('admin.reasonModal.submitting') : t('admin.tax.reject')}
        </button>
      </div>
    </div>
  );
}

// Duyet ho so thue/giay to host da nop qua trang Host Settings
export default function AdminTaxVerificationPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-tax'], queryFn: adminService.getTaxVerifications });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-tax'] });
  }

  const verifyMutation = useMutation({
    mutationFn: (id) => adminService.reviewTaxInfo(id, 'verified'),
    onSuccess: () => {
      toast.success(t('admin.tax.verifySuccess'));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, t('admin.tax.verifyErrorFallback'))),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }) => adminService.reviewTaxInfo(id, 'rejected', note),
    onSuccess: () => {
      toast.success(t('admin.tax.rejectSuccess'));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, t('admin.tax.rejectErrorFallback'))),
  });

  const users = data || [];

  return (
    <AdminLayout>
      <Seo title={t('admin.tax.pageTitle')} noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('admin.tax.heading')}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('admin.tax.subheading')}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">{t('admin.tax.loading')}</p>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">{t('admin.tax.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-neutral-900">{u.fullName}</p>
                  <p className="text-xs text-neutral-500">{u.email}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate(u.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {t('admin.tax.verify')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectingId(u.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t('admin.tax.reject')}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('admin.tax.legalName')}</p>
                  <p className="text-neutral-900">{u.legalName || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('admin.tax.taxId')}</p>
                  <p className="text-neutral-900">{u.taxId || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('admin.tax.taxpayerType')}</p>
                  <p className="text-neutral-900">{t(`admin.tax.taxpayerLabel.${u.taxpayerType}`, { defaultValue: '—' })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-neutral-400">{t('admin.tax.idNumber')}</p>
                  <p className="text-neutral-900">{u.idNumber || '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectingId && (
        <RejectModal
          onClose={() => setRejectingId(null)}
          onConfirm={(note) => rejectMutation.mutateAsync({ id: rejectingId, note })}
        />
      )}
    </AdminLayout>
  );
}
