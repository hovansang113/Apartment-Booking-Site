import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../services/authService';
import { GoogleIcon } from '../../components/common/icons';
import Seo from '../../components/common/Seo';
import logoFull from '../../assets/logo-full.png';

// An tam nut Google login theo yeu cau (19/8) - chua noi OAuth that, chi hien
// toast "coming soon". Doi lai true khi da co OAuth that, khong xoa code.
const SHOW_GOOGLE_LOGIN = false;

export default function RegisterPage() {
  const { t } = useTranslation();
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
    toast(t('auth.googleComingSoon'), {
      icon: '💡',
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      toast.error(t('auth.register.fillRequired'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.register.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('auth.register.passwordTooShort'));
      return;
    }

    if (!agreed) {
      toast.error(t('auth.register.mustAgree'));
      return;
    }

    try {
      setLoading(true);
      const res = await registerApi({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role: 'host',
      });

      login(res.user);
      toast.success(t('auth.register.success'));
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.register.genericError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Seo title={t('auth.register.pageTitle')} path="/auth/register" noindex />
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <img src={logoFull} alt={t('common.brand')} className="mx-auto mb-6 h-14 w-auto" />
          <h1 className="text-2xl font-bold text-neutral-900">{t('auth.register.title')}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {t('auth.register.subtitle')}
          </p>
        </div>

        {/* Form Registration First */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              {t('auth.register.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.register.fullNamePlaceholder')}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              {t('auth.register.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.register.emailPlaceholder')}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              {t('auth.register.phone')}
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
              {t('auth.register.password')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.register.passwordPlaceholder')}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              {t('auth.register.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
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
              {t('auth.register.agreePrefix')}{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="underline font-medium">
                {t('auth.register.terms')}
              </a>{' '}
              {t('auth.register.and')}{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="underline font-medium">
                {t('auth.register.privacy')}
              </a>{' '}
              {t('auth.register.agreeSuffix')}
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </button>
        </form>

        {SHOW_GOOGLE_LOGIN && (
          <>
            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-semibold text-neutral-400 uppercase">{t('auth.or')}</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Google OAuth Option Below */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>{t('auth.continueWithGoogle')}</span>
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-neutral-600">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/auth/login" className="font-semibold text-brand-600 underline">
            {t('auth.register.loginNow')}
          </Link>
        </p>
      </div>
    </main>
  );
}
