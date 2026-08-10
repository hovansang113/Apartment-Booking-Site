import { Helmet } from 'react-helmet-async';

export default function HostCalendarPage() {
  return (
    <>
      <Helmet>
        <title>Lịch cho thuê — Stayhub Host</title>
      </Helmet>

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-neutral-200 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Lịch cho thuê</h1>
            <p className="mt-1 text-sm text-neutral-500">Quản lý ngày trống, giá phòng và chặn ngày thủ công</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <h2 className="text-lg font-semibold text-neutral-800">Quản lý lịch phòng</h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-sm mx-auto">
              Xem và đặt giá theo ngày cho từng bài đăng sau khi bạn đã hoàn tất đăng bài.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
