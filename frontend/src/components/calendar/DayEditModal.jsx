import { useState } from 'react';
import { CloseIcon } from '../common/icons';

function formatDayLabel(ymd) {
  const [, month, day] = ymd.split('-');
  const MONTHS_SHORT = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
  return `${MONTHS_SHORT[Number(month) - 1]} ${Number(day)}`;
}

// REQ_12: sua trang thai 1 ngay (available/blocked) + gia rieng cho ngay do +
// ghi chu + "Custom settings" (so dem toi thieu/toi da neu check-in ngay nay).
// onSave goi calendarService that (block/unblock + price + stay-rule).
export default function DayEditModal({ day, defaultPrice, onClose, onSave }) {
  const [blocked, setBlocked] = useState(day.status === 'blocked');
  const [price, setPrice] = useState(day.price);
  const [note, setNote] = useState(day.note || '');
  const [showCustomSettings, setShowCustomSettings] = useState(Boolean(day.minNights || day.maxNights));
  const [minNights, setMinNights] = useState(day.minNights || '');
  const [maxNights, setMaxNights] = useState(day.maxNights || '');

  function handleSave() {
    onSave({
      date: day.date,
      status: blocked ? 'blocked' : 'available',
      price,
      note: note.trim(),
      minNights: showCustomSettings && minNights ? Number(minNights) : null,
      maxNights: showCustomSettings && maxNights ? Number(maxNights) : null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white">
            {formatDayLabel(day.date)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
            aria-label="Đóng"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <span className={`h-2 w-2 rounded-full ${blocked ? 'bg-neutral-400' : 'bg-emerald-400'}`} />
            {blocked ? 'Đã chặn' : 'Còn trống'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!blocked}
            onClick={() => setBlocked((b) => !b)}
            className={`relative h-6 w-11 rounded-full transition-colors ${blocked ? 'bg-neutral-600' : 'bg-white'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
                blocked ? 'left-0.5 bg-white' : 'left-[22px] bg-neutral-900'
              }`}
            />
          </button>
        </div>

        <div className="mt-2.5 rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
          <p className="text-xs text-neutral-400">Giá riêng cho ngày này</p>
          <div className="mt-1 flex items-baseline gap-2">
            <input
              type="number"
              min={0}
              step={10000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-28 border-b border-white/30 bg-transparent text-2xl font-bold outline-none focus:border-white"
            />
            {price !== defaultPrice && (
              <span className="text-sm text-neutral-400 line-through">
                {new Intl.NumberFormat('vi-VN').format(defaultPrice)}
              </span>
            )}
          </div>
        </div>

        {blocked && (
          <div className="mt-2.5 rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
            <p className="text-xs text-neutral-400">Ghi chú (lý do chặn ngày này)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="VD: Bảo trì điều hoà"
              className="mt-1 w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
          </div>
        )}

        {!blocked && (
          <div className="mt-2.5 rounded-xl bg-neutral-900 px-4 py-3.5 text-white">
            <button
              type="button"
              onClick={() => setShowCustomSettings((s) => !s)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              Cài đặt khác
              <span className={`transition-transform ${showCustomSettings ? 'rotate-45' : ''}`}>+</span>
            </button>

            {showCustomSettings && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Tối thiểu (đêm)</label>
                  <input
                    type="number"
                    min={1}
                    value={minNights}
                    onChange={(e) => setMinNights(e.target.value)}
                    placeholder="Không giới hạn"
                    className="mt-1 w-full border-b border-white/30 bg-transparent text-sm outline-none focus:border-white placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Tối đa (đêm)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxNights}
                    onChange={(e) => setMaxNights(e.target.value)}
                    placeholder="Không giới hạn"
                    className="mt-1 w-full border-b border-white/30 bg-transparent text-sm outline-none focus:border-white placeholder:text-neutral-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
