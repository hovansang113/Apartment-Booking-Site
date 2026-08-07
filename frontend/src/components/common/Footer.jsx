export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-500 sm:px-6 lg:px-8">
        <nav aria-label="Chân trang" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="/help" className="hover:underline">
            Trung tâm trợ giúp
          </a>
          <a href="/host" className="hover:underline">
            Cho thuê chỗ ở của bạn
          </a>
          <a href="/about" className="hover:underline">
            Về Stayhub
          </a>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} Stayhub. Đây là dự án học tập, không phải dịch vụ thật.</p>
      </div>
    </footer>
  );
}
