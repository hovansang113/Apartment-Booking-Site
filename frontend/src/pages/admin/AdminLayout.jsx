import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/admin',          label: 'Overview',  end: true },
  { to: '/admin/listings', label: 'Listings'             },
  { to: '/admin/users',    label: 'Users'                },
];

export default function AdminLayout({ children }) {
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
            <nav className="flex h-full">
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
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
    </div>
  );
}
