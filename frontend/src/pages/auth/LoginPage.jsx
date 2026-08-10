import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/authService';
import { GoogleIcon } from '../../components/common/icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/host/listings';

  function handleGoogleLogin() {
    toast('Tính năng đăng nhập với Google sẽ ra mắt ở phiên bản tiếp theo!', {
      icon: '💡',
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Vui lòng điền Email và Mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(email.trim(), password);

      login(res.user, res.token);
      toast.success(`Chào mừng trở lại, ${res.user.fullName}!`);

      if (res.user.role === 'host') {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại Email/Mật khẩu!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Đăng nhập tài khoản</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Quản lý phòng cho thuê và các đơn đặt phòng của bạn
          </p>
        </div>

        {/* Form Login First */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-neutral-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-neutral-500 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs font-semibold text-neutral-400 uppercase">Hoặc</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* Google OAuth Option Below */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <GoogleIcon className="h-5 w-5" />
          <span>Tiếp tục với Google</span>
        </button>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Chưa có tài khoản chủ nhà?{' '}
          <Link to="/auth/register" className="font-semibold text-brand-600 underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
