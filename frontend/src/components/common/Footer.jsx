import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-500 sm:px-6 lg:px-8">
        <nav aria-label={t('footer.ariaLabel')} className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="/help" className="hover:underline">
            {t('footer.help')}
          </a>
          <a href="/host" className="hover:underline">
            {t('footer.becomeHost')}
          </a>
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
