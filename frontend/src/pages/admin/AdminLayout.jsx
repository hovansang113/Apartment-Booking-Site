import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { to: '/admin',          label: 'Overview',  end: true },
  { to: '/admin/listings', label: 'Listings'             },
  { to: '/admin/users',    label: 'Users'                },
];

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/auth/login');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6EF' }}>
      <div style={{ backgroundColor: '#0d9488' }}>
        <div className="mx-auto max-w-5xl px-8">
          <div className="flex items-center gap-8 h-14">
            {/* Wordmark — duy nhất 1 lần */}
            <span
              className="shrink-0 text-[15px] font-bold tracking-tight text-white"
              style={{ letterSpacing: '-0.01em' }}
            >
              stayhub
            </span>

            {/* Divider */}
            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.25)' }} />

            {/* Tabs */}
            <nav className="flex h-full flex-1">
              {TABS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `flex items-center h-full px-1 mr-6 text-[13px] font-medium border-b-2 transition-colors duration-150 ${
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-white/60 hover:text-white'
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4 shrink-0">
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="text-[12px] text-white/50 hover:text-white transition-colors">
                View site ↗
              </a>
              <div style={{ width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <Link to="/profile" className="flex items-center gap-2 group">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.fullName} referrerPolicy="no-referrer" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/30" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {(user?.fullName || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-white leading-tight group-hover:underline">{user?.fullName}</p>
                  <p className="text-[10px] text-white/50 capitalize leading-tight">{user?.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-[12px] font-medium text-white/50 hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
    </div>
  );
}
