export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-sm" style={{ backgroundColor: '#0d9488', color: '#ccfbf1' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3">
          {[
            { title: 'Explore', links: [{ label: 'Home', href: '/' }, { label: 'All listings', href: '/listings' }] },
            { title: 'Hosting', links: [{ label: 'Become a host', href: '/host' }, { label: 'Manage listings', href: '/host/listings' }] },
            { title: 'Stayhub', links: [{ label: 'About us', href: '/about' }, { label: 'Help centre', href: '/help' }] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-semibold" style={{ color: '#f0fdfa' }}>{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="hover:text-white transition-colors" style={{ color: '#99f6e4' }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', color: '#5eead4' }}
        >
          <p>© {year} Stayhub by Hodfords.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms"   className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
