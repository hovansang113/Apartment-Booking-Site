import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import SearchBar from './SearchBar';
import { GlobeIcon, MenuIcon, UserCircleIcon } from './icons';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
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
    toast.success('Đã đăng xuất tài khoản');
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
            stayhub
          </Link>

          {/* Host Navigation Center Tabs */}
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <Link
              to="/host/today"
              className={`relative py-1 transition-colors ${
                isToday ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Hôm nay
            </Link>
            <Link
              to="/host/calendar"
              className={`relative py-1 transition-colors ${
                isCalendar ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Lịch
            </Link>
            <Link
              to="/host/listings"
              className={`relative py-1 transition-colors ${
                isListings ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Bài đăng
            </Link>
            {/* Note: "Tin nhắn" tab removed as per user request */}
          </nav>

          {/* Right Action & Profile Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden rounded-full px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 sm:inline-block transition-colors"
            >
              Chuyển sang chế độ du lịch
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
                      Chủ nhà (Host)
                    </span>
                  </div>

                  <Link
                    to="/host/listings/new"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                  >
                    Tạo bài đăng mới
                  </Link>

                  <Link
                    to="/host/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Thông tin thuế &amp; giấy tờ
                    {(!user.verificationStatus || user.verificationStatus === 'unverified') && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-label="Chưa xác minh" />
                    )}
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Chế độ dành cho Khách
                  </Link>

                  <div className="my-1 border-t border-neutral-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Đăng xuất
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
          stayhub
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <nav aria-label="Tài khoản" className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!user) navigate('/auth/register');
              else if (user.role === 'host' || user.role === 'admin') navigate('/host/today');
              else navigate('/host');
            }}
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 lg:inline-block transition-colors"
          >
            Cho thuê chỗ ở của bạn
          </button>
          <button
            type="button"
            aria-label="Ngôn ngữ"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 sm:flex transition-colors"
          >
            <GlobeIcon className="h-5 w-5" />
          </button>

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
                        {user.role === 'host' ? 'Chủ nhà (Host)' : user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                      </span>
                    </div>

                    {(user.role === 'host' || user.role === 'admin') && (
                      <>
                        <Link
                          to="/host/today"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                        >
                          Trang quản lý Hôm nay
                        </Link>
                        <Link
                          to="/host/listings"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                        >
                          Quản lý bài đăng
                        </Link>
                        <Link
                          to="/host/listings/new"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                        >
                          Tạo bài đăng mới
                        </Link>
                      </>
                    )}

                    <Link
                      to="/bookings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Chuyến đi đã đặt
                    </Link>

                    <div className="my-1 border-t border-neutral-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Đăng ký tài khoản Chủ nhà
                    </Link>
                    <div className="my-1 border-t border-neutral-100" />
                    <Link
                      to="/host"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Cho thuê chỗ ở của bạn
                    </Link>
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
