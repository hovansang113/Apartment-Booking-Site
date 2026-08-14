import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { GlobeIcon, MenuIcon, UserCircleIcon } from './icons';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 text-2xl font-bold text-brand-600">
          stayhub
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <nav aria-label="Account" className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            to="/host"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 lg:inline-block"
          >
            Become a host
          </Link>
          <button
            type="button"
            aria-label="Language"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 sm:flex"
          >
            <GlobeIcon className="h-5 w-5" />
          </button>

          {user && <NotificationBell />}

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-3 rounded-full border border-neutral-300 py-2 pl-3 pr-2 hover:shadow-md transition-shadow"
            >
              <MenuIcon className="h-4 w-4 text-neutral-700" />
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              {(!user?.avatarUrl) ? (
                <UserCircleIcon className="h-7 w-7 text-neutral-500" />
              ) : (
                <div style={{display:'none'}} className="h-7 w-7 rounded-full bg-teal-600 items-center justify-center text-white text-xs font-bold">
                  {(user?.fullName || '?')[0].toUpperCase()}
                </div>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-neutral-200 bg-white shadow-lg py-1 text-sm">
                {user ? (
                  <>
                    <div className="px-4 py-2 font-semibold text-neutral-800 border-b border-neutral-100">
                      {user.fullName}
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                        Admin panel
                      </Link>
                    )}
                    {user.role === 'host' && (
                      <>
                        <Link to="/host/stats" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                          Doanh thu
                        </Link>
                        <Link to="/host/listings" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                          My listings
                        </Link>
                        <Link to="/host/bookings" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                          Manage bookings
                        </Link>
                        <Link to="/host/calendar" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                          Calendar
                        </Link>
                        <Link to="/host/pricing" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                          Pricing
                        </Link>
                      </>
                    )}
                    {user.role === 'user' && (
                      <Link to="/bookings" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                        My bookings
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                      Edit profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-neutral-700 border-t border-neutral-100 mt-1"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" onClick={() => setOpen(false)} className="block px-4 py-2 font-semibold hover:bg-neutral-50 text-neutral-800">
                      Log in
                    </Link>
                    <Link to="/auth/register" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700">
                      Sign up as host
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
