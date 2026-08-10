import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CategoryIcon } from '../../components/common/icons';

const STEPS = [
  {
    icon: 'homestay',
    title: 'Kể cho chúng tôi về chỗ ở của bạn',
    body: 'Chia sẻ vài thông tin cơ bản, ví dụ như vị trí và số khách bạn có thể đón.',
  },
  {
    icon: 'apartment',
    title: 'Làm cho chỗ ở nổi bật',
    body: 'Thêm ít nhất 5 ảnh, một tiêu đề và mô tả ngắn — bạn có thể chỉnh sửa lại bất cứ lúc nào.',
  },
  {
    icon: 'house',
    title: 'Hoàn thiện và đăng tin',
    body: 'Chọn mức giá khởi điểm, xem lại thông tin rồi đăng tin. Đội ngũ quản trị sẽ duyệt trước khi tin hiển thị công khai.',
  },
];

export default function BecomeHostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHost = user?.role === 'host' || user?.role === 'admin';

  function handleStart() {
    if (!user) {
      navigate('/auth/register');
      return;
    }
    if (isHost) {
      navigate('/host/listings/new');
      return;
    }
    navigate('/auth/register');
  }

  return (
    <main>
      <section className="border-b border-neutral-200 bg-brand-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
              Cho thuê chỗ ở, đón thêm thu nhập
            </h1>
            <p className="mt-4 max-w-md text-lg text-neutral-600">
              Đăng tin miễn phí, kiểm soát lịch trống và giá cả theo ý bạn. Stayhub tự động xác nhận
              đặt phòng ngay khi lịch còn trống — không cần chờ duyệt từng yêu cầu.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="mt-8 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Bắt đầu ngay
            </button>
            {user && !isHost && (
              <p className="mt-3 text-sm text-neutral-500">
                Tài khoản hiện tại của bạn chưa phải tài khoản chủ nhà — bạn có thể đăng ký 1 tài khoản chủ nhà riêng để đăng tin.
              </p>
            )}
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=60"
              alt="Chủ nhà chuẩn bị đón khách"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-neutral-900">Bắt đầu chỉ với 3 bước</h2>
        <ol className="mt-10 space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold">
                <CategoryIcon name={step.icon} className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-700">Bước {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-1 text-neutral-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            Bắt đầu ngay
          </button>
          {!user && (
            <p className="mt-3 text-sm text-neutral-500">
              Đã có tài khoản chủ nhà?{' '}
              <Link to="/auth/login" className="font-medium text-brand-700 underline">
                Đăng nhập
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
