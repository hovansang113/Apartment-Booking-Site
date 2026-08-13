import { useState } from 'react';
import { CloseIcon } from '../common/icons';

// Modal nhap ly do bat buoc - dung chung cho dinh chi listing (REQ_03) va
// khoa tai khoan (REQ_04), ca 2 backend deu bat buoc phai co reason.
export default function ReasonModal({ title, confirmLabel, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-neutral-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-700" aria-label="Đóng">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Nhập lý do..."
          className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="button"
          disabled={!reason.trim() || submitting}
          onClick={handleConfirm}
          className="mt-3 w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Đang xử lý...' : confirmLabel}
        </button>
      </div>
    </div>
  );
}
