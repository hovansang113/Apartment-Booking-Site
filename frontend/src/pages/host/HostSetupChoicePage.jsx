import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronRightIcon,
  HomeOutlineIcon,
  HomePlusIcon,
  DuplicateIcon,
} from '../../components/common/icons';

export default function HostSetupChoicePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName ? user.fullName.split(' ').pop() : 'Sang';

  return (
    <>
      <Helmet>
        <title>Tạo bài đăng mới — Stayhub Host</title>
      </Helmet>

      <div className="flex min-h-screen flex-col bg-white text-neutral-900">
        {/* Top Minimal Header (Matching Header.jsx layout) */}
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/host/today" className="shrink-0 text-2xl font-bold text-brand-600 tracking-tight">
              stayhub
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast('Bộ phận hỗ trợ luôn sẵn sàng 24/7!', { icon: '💡' })}
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                Bạn có thắc mắc?
              </button>
              <Link
                to="/host/listings"
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                Thoát
              </Link>
            </div>
          </div>
        </header>

        {/* Full Page Main Content (Matching Screenshot 2026-08-10 145303.png) */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
          <div className="w-full space-y-8 animate-fadeIn">
            {/* Personalized Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
                Chào mừng {userName} quay trở lại
              </h1>
            </div>

            {/* Section 1: Hoàn thiện bài đăng của bạn */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900">
                Hoàn thiện bài đăng của bạn
              </h2>

              <div
                onClick={() => navigate('/host/listings/new?draftId=draft-1&step=3')}
                className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-neutral-900 hover:shadow-lg cursor-pointer transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 shrink-0 group-hover:bg-neutral-200 transition-colors">
                  <HomeOutlineIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm leading-snug group-hover:text-brand-600 transition-colors">
                    Nhà/phòng cho thuê thuộc loại hình Căn hộ của bạn đã được tạo vào 5 tháng 8, 2026
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Bắt đầu tạo bài đăng mới */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-neutral-900">
                Bắt đầu tạo bài đăng mới
              </h2>

              <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => navigate('/host/listings/new')}
                  className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <HomePlusIcon className="h-6 w-6 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
                    <span className="font-semibold text-neutral-900 text-base">Tạo bài đăng mới</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.success('Đã sao chép bài đăng gần nhất!');
                    navigate('/host/listings/new');
                  }}
                  className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <DuplicateIcon className="h-6 w-6 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
                    <span className="font-semibold text-neutral-900 text-base">Tạo từ một bài đăng hiện có</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
