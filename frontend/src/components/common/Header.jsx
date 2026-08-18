import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SearchBar from './SearchBar';
import { MenuIcon, UserCircleIcon } from './icons';
import { useAuth } from '../../context/AuthContext';

// An tam nut/link "List your place" theo yeu cau Jason (17/8) - it listing
// that nen chua can dan nguoi dung vao luong dang ky host. Doi lai true khi
// can bat lai, khong xoa code.
const SHOW_BECOME_HOST_LINK = false;

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isHostMode = location.pathname.startsWith('/host') && user && (user.role === 'host' || user.role === 'admin');

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    toast.success(t('common.loggedOut'));
    navigate('/');
  }

  // Host Mode Navigation Header (Matches exact design in Screenshot)
  if (isHostMode) {
    const isToday = location.pathname === '/host' || location.pathname === '/host/today' || location.pathname === '/host/dashboard';
    const isCalendar = location.pathname === '/host/calendar';
    const isListings = location.pathname.startsWith('/host/listings');

    return (
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/host/today" className="shrink-0 text-2xl font-bold text-brand-600 tracking-tight">
            {t('common.brand')}
          </Link>

          {/* Host Navigation Center Tabs */}
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <Link
              to="/host/today"
              className={`relative py-1 transition-colors ${
                isToday ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t('header.hostModeHome')}
            </Link>
            <Link
              to="/host/calendar"
              className={`relative py-1 transition-colors ${
                isCalendar ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t('header.hostModeCalendar')}
            </Link>
            <Link
              to="/host/listings"
              className={`relative py-1 transition-colors ${
                isListings ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t('header.hostModeListings')}
            </Link>
          </nav>

          {/* Right Action & Profile Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden rounded-full px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 sm:inline-block transition-colors"
            >
              {t('header.switchToTravel')}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-3 rounded-full border border-neutral-300 py-1.5 pl-3 pr-1.5 hover:shadow-md transition-shadow"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
                </div>
                <MenuIcon className="h-4 w-4 text-neutral-700" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl text-sm">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="font-semibold text-neutral-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 uppercase">
                      {t('header.hostBadge')}
                    </span>
                  </div>

                  <Link
                    to="/host/listings/new"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                  >
                    {t('header.createListing')}
                  </Link>

                  <Link
                    to="/host/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {t('header.taxInfo')}
                    {(!user.verificationStatus || user.verificationStatus === 'unverified') && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-label="unverified" />
                    )}
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {t('header.guestMode')}
                  </Link>

                  <div className="my-1 border-t border-neutral-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Standard Guest Mode Header
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 text-2xl font-bold text-brand-600 tracking-tight">
          {t('common.brand')}
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <nav aria-label={t('header.myTrips')} className="ml-auto flex shrink-0 items-center gap-2">
          {SHOW_BECOME_HOST_LINK && (
            <button
              type="button"
              onClick={() => {
                if (!user) navigate('/auth/register');
                else if (user.role === 'host' || user.role === 'admin') navigate('/host/today');
                else navigate('/host');
              }}
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 lg:inline-block transition-colors"
            >
              {t('header.becomeHost')}
            </button>
          )}

          {/* User Profile / Auth Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-3 rounded-full border border-neutral-300 py-2 pl-3 pr-2 hover:shadow-md transition-shadow"
            >
              <MenuIcon className="h-4 w-4 text-neutral-700" />
              {user ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 font-semibold text-xs text-white">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                <UserCircleIcon className="h-7 w-7 text-neutral-500" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl text-sm">
                {user ? (
                  <>
                    <div className="border-b border-neutral-100 px-4 py-3">
                      <p className="font-semibold text-neutral-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>

                      <span className="mt-1.5 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 uppercase">
                        {user.role === 'host' ? t('header.hostRole') : user.role === 'admin' ? t('header.adminRole') : t('header.userRole')}
                      </span>
                    </div>

                    {(user.role === 'host' || user.role === 'admin') && (
                      <>
                        <Link
                          to="/host/today"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                        >
                          {t('header.manageToday')}
                        </Link>
                        <Link
                          to="/host/listings"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                        >
                          {t('header.manageListings')}
                        </Link>
                        <Link
                          to="/host/listings/new"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                        >
                          {t('header.createListing')}
                        </Link>
                      </>
                    )}

                    <Link
                      to="/bookings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {t('header.myTrips')}
                    </Link>

                    <div className="my-1 border-t border-neutral-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      {t('header.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      {t('header.login')}
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {t('header.registerHost')}
                    </Link>
                    {SHOW_BECOME_HOST_LINK && (
                      <>
                        <div className="my-1 border-t border-neutral-100" />
                        <Link
                          to="/host"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          {t('header.becomeHost')}
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
