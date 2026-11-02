import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { guestLogin as guestLoginApi, login as loginApi } from '../../services/authService';
import { GoogleIcon, LightbulbIcon } from '../../components/common/icons';
import Seo from '../../components/common/Seo';
import logoFull from '../../assets/logo-full.png';

// An tam nut Google login theo yeu cau (19/8) - chua noi OAuth that, chi hien
// toast "coming soon". Doi lai true khi da co OAuth that, khong xoa code.
const SHOW_GOOGLE_LOGIN = false;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestLoginMode, setGuestLoginMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestedPath = location.state?.from?.pathname;

  function handleGoogleLogin() {
    toast(t('auth.googleComingSoon'), {
      icon: <LightbulbIcon className="h-5 w-5 text-brand-600" />,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error(t('auth.login.fillRequired'));
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(email.trim(), password);

      login(res.user);
      toast.success(t('auth.login.welcomeBack', { name: res.user.fullName }));

      if (res.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (res.user.role === 'host') {
        navigate(requestedPath || '/host/listings', { replace: true });
      } else {
        navigate(requestedPath || '/bookings', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.login.genericError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin(e) {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !phone.trim()) {
      toast.error(t('auth.guestLogin.fillRequired'));
      return;
    }

    try {
      setLoading(true);
      const res = await guestLoginApi({ email: email.trim(), fullName: fullName.trim(), phone: phone.trim() });
      login(res.user);
      toast.success(t('auth.guestLogin.welcome', { name: res.user.fullName }));
      navigate(location.state?.from?.pathname || '/bookings', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.guestLogin.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Seo title={t('auth.login.pageTitle')} path="/auth/login" noindex />
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <img src={logoFull} alt={t('common.brand')} className="mx-auto mb-6 h-14 w-auto" />
          <h1 className="text-2xl font-bold text-neutral-900">{t('auth.login.title')}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <form onSubmit={guestLoginMode ? handleGuestLogin : handleSubmit} className="space-y-4">
          {guestLoginMode && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-700">
                {t('auth.guestLogin.fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
              {t('auth.login.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder')}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
          </div>

          {guestLoginMode ? (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-700">
                {t('auth.guestLogin.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase text-neutral-700">
                  {t('auth.login.password')} <span className="text-red-500">*</span>
                </label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-neutral-500 hover:underline">
                  {t('auth.login.forgotPassword')}
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.login.passwordPlaceholder')}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? (guestLoginMode ? t('auth.guestLogin.submitting') : t('auth.login.submitting'))
              : (guestLoginMode ? t('auth.guestLogin.submit') : t('auth.login.submit'))}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setGuestLoginMode((current) => !current)}
          className="mt-4 w-full text-sm font-semibold text-brand-600 hover:underline"
        >
          {guestLoginMode ? t('auth.guestLogin.usePassword') : t('auth.guestLogin.useQuickLogin')}
        </button>

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
          {t('auth.login.noAccount')}{' '}
          <Link to="/auth/register" className="font-semibold text-brand-600 underline">
            {t('auth.login.registerNow')}
          </Link>
        </p>
      </div>
    </main>
  );
}
