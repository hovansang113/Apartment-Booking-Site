export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* 3-column links */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-sm">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-3">Hỗ trợ</h3>
            <ul className="space-y-2 text-neutral-500">
              <li><a href="/help" className="hover:text-neutral-800 transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="/safety" className="hover:text-neutral-800 transition-colors">Thông tin an toàn</a></li>
              <li><a href="/cancellation" className="hover:text-neutral-800 transition-colors">Chính sách hủy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 mb-3">Cho thuê</h3>
            <ul className="space-y-2 text-neutral-500">
              <li><a href="/host" className="hover:text-neutral-800 transition-colors">Cho thuê chỗ ở của bạn</a></li>
              <li><a href="/host/resources" className="hover:text-neutral-800 transition-colors">Tài nguyên dành cho host</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 mb-3">Stayhub</h3>
            <ul className="space-y-2 text-neutral-500">
              <li><a href="/about" className="hover:text-neutral-800 transition-colors">Về Stayhub</a></li>
              <li><a href="/careers" className="hover:text-neutral-800 transition-colors">Tuyển dụng</a></li>
            </ul>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-8 border-t border-neutral-200 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Stayhub. Đây là dự án học tập, không phải dịch vụ thật.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-neutral-600 transition-colors">Quyền riêng tư</a>
            <a href="/terms" className="hover:text-neutral-600 transition-colors">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
