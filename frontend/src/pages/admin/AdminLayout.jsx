import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/listings', label: 'Listing' },
  { to: '/admin/users', label: 'Người dùng' },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center gap-6 py-4">
            <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            <nav className="flex gap-1">
              {TABS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
