import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../services/authService';
import { GoogleIcon } from '../../components/common/icons';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/host/listings';

  function handleGoogleLogin() {
    toast('Tính năng đăng nhập với Google sẽ ra mắt ở phiên bản tiếp theo!', {
      icon: '💡',
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!agreed) {
      toast.error('Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục');
      return;
    }

    try {
      setLoading(true);
      const res = await registerApi({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });

      login(res.user, res.token);
      toast.success('Đăng ký tài khoản Chủ nhà thành công!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Đăng ký tài khoản Chủ nhà</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Bắt đầu cho thuê chỗ ở và đón thêm thu nhập cùng Stayhub
          </p>
        </div>

        {/* Form Registration First */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

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
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              Xác nhận Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-neutral-600">
              Tôi đồng ý với{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="underline font-medium">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="underline font-medium">
                Chính sách bảo mật
              </a>{' '}
              của Stayhub.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản Chủ nhà'}
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
          Đã có tài khoản chủ nhà?{' '}
          <Link to="/auth/login" className="font-semibold text-brand-600 underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
