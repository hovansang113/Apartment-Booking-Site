import { useTranslation } from 'react-i18next';

const STEP_KEYS = ['dates', 'guest', 'payment'];

// Thanh buoc tren dau CheckoutPage/PaymentPage - tham khao bo cuc stepper cua
// booking-directly.com (Room Selection -> Booking Extras -> Guest Details ->
// Payments), rut gon con 3 buoc khop dung luong that cua minh (chon ngay dien
// ra ngay tren trang listing, khong phai 1 trang rieng). `current` la step
// dang o - cac step truoc do tu dong hien dau tick.
export default function BookingStepper({ current, completed = false }) {
  const { t } = useTranslation();
  const currentIndex = STEP_KEYS.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-2 py-5 text-sm">
      {STEP_KEYS.map((key, i) => {
        const isDone = i < currentIndex || (i === currentIndex && completed);
        const isCurrent = i === currentIndex && !completed;
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                  isDone
                    ? 'bg-brand-600 text-white'
                    : isCurrent
                      ? 'border-2 border-brand-600 text-brand-600'
                      : 'border border-neutral-300 text-neutral-400'
                }`}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={isCurrent ? 'font-semibold text-neutral-900' : isDone ? 'text-brand-600' : 'text-neutral-400'}>
                {t(`checkout.steps.${key}`)}
              </span>
            </div>
            {i < STEP_KEYS.length - 1 && (
              <span className="relative h-px w-8 overflow-hidden bg-neutral-200 sm:w-16">
                {isDone && <span key={key} className="animate-stepper-line absolute inset-0 bg-brand-600" />}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
