import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// Layout rieng cho khu vuc admin - KHONG dung chung Header/Footer cong khai
// (khong search bar, khong "Chuyen sang che do du lich"...), giong dung
// pattern "standalone page" da co san cho CreateListingPage.jsx. Admin la khu
// vuc quan tri, khong phai trai nghiem khach/host nen tach layout rieng cho
// dung chuan.
export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();

  const TABS = [
    { to: '/admin/listings', label: t('admin.layout.tabListings') },
    { to: '/admin/users', label: t('admin.layout.tabUsers') },
    { to: '/admin/tax-verifications', label: t('admin.layout.tabTax') },
  ];

  async function handleLogout() {
    await logout();
    toast.success(t('admin.layout.logoutSuccess'));
    window.location.href = '/auth/login';
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/admin/listings" className="text-xl font-bold text-neutral-900 tracking-tight">
              stayhub <span className="text-brand-600">admin</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold">
              {TABS.map((tab) => {
                const active = location.pathname === tab.to;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`py-1 transition-colors ${
                      active ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-neutral-500 truncate max-w-[160px]">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              {t('admin.layout.logout')}
            </button>
          </div>
        </div>

        <nav className="flex sm:hidden items-center gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 text-sm font-semibold">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to;
            return (
              <Link key={tab.to} to={tab.to} className={active ? 'text-neutral-900' : 'text-neutral-500'}>
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
