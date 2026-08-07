export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-100 text-sm text-neutral-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main links */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 font-semibold text-neutral-800">Khám phá</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:underline">Trang chủ</a></li>
              <li><a href="/listings" className="hover:underline">Tất cả phòng</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-neutral-800">Chủ nhà</h3>
            <ul className="space-y-2">
              <li><a href="/host" className="hover:underline">Cho thuê chỗ ở</a></li>
              <li><a href="/host/listings" className="hover:underline">Quản lý phòng</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-neutral-800">Stayhub</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:underline">Về chúng tôi</a></li>
              <li><a href="/help" className="hover:underline">Trung tâm trợ giúp</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t border-neutral-200 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Stayhub. Đây là dự án học tập, không phải dịch vụ thật.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:underline">Quyền riêng tư</a>
            <a href="/terms" className="hover:underline">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
