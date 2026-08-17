import { useTranslation } from 'react-i18next';

// An tam link "Cho thue cho o" theo yeu cau Jason (17/8) - it listing that
// nen chua can dan nguoi dung vao luong dang ky host. Doi lai true khi can
// bat lai, khong xoa code.
const SHOW_BECOME_HOST_LINK = false;

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-500 sm:px-6 lg:px-8">
        <nav aria-label={t('footer.ariaLabel')} className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="/help" className="hover:underline">
            {t('footer.help')}
          </a>
          {SHOW_BECOME_HOST_LINK && (
            <a href="/host" className="hover:underline">
              {t('footer.becomeHost')}
            </a>
          )}
          <a href="/about" className="hover:underline">
            {t('footer.about')}
          </a>
        </nav>
        <p className="mt-4">
          © {new Date().getFullYear()} Stayhub. {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
