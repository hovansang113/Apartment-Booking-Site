import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateTaxInfo } from '../../services/authService';

const TAXPAYER_TYPES = [
  { value: 'individual', label: 'Cá nhân', desc: 'Cho thuê dưới danh nghĩa cá nhân' },
  { value: 'household_business', label: 'Hộ kinh doanh', desc: 'Đã đăng ký hộ kinh doanh cá thể' },
  { value: 'company', label: 'Doanh nghiệp', desc: 'Cho thuê dưới danh nghĩa công ty/doanh nghiệp' },
];

const STATUS_LABEL = {
  unverified: { text: 'Chưa xác minh', className: 'bg-neutral-100 text-neutral-600' },
  pending: { text: 'Đang chờ xác minh', className: 'bg-amber-100 text-amber-700' },
  verified: { text: 'Đã xác minh', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { text: 'Bị từ chối', className: 'bg-red-100 text-red-700' },
};

// "Settings" giay to/thue cho host - mo phong theo cach Airbnb thu thap thong
// tin thue that (Form W-9: ten phap ly, dia chi, tax ID, tax classification).
// KHONG phai tu van phap ly/thue Viet Nam chinh thuc - chi la UI mo phong cho
// du an hoc tap. Chua co man hinh admin duyet that (REQ_03) nen trang thai se
// giu o "pending" sau khi nop.
export default function HostSettingsPage() {
  const { user, login } = useAuth();
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [taxpayerType, setTaxpayerType] = useState('individual');
  const [idNumber, setIdNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // AuthContext nap user bat dong bo (goi getMe() luc mount), nen o lan render
  // dau user van con null - phai dong bo lai form bang useEffect thay vi chi
  // dua vao gia tri khoi tao cua useState (chi chay 1 lan, khong tu cap nhat
  // khi user den sau).
  useEffect(() => {
    if (user) {
      setLegalName(user.legalName || '');
      setTaxId(user.taxId || '');
      setTaxpayerType(user.taxpayerType || 'individual');
      setIdNumber(user.idNumber || '');
    }
  }, [user]);

  const status = STATUS_LABEL[user?.verificationStatus || 'unverified'];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!legalName.trim() || !taxId.trim()) {
      toast.error('Vui lòng nhập đủ họ tên và mã số thuế');
      return;
    }

    try {
      setSaving(true);
      const res = await updateTaxInfo({ legalName: legalName.trim(), taxId: taxId.trim(), taxpayerType, idNumber: idNumber.trim() });
      login(res.user);
      toast.success('Đã gửi thông tin, đang chờ xác minh');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, thử lại sau');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Thông tin thuế — Stayhub Host</title>
      </Helmet>

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Thông tin thuế &amp; giấy tờ</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Cung cấp thông tin để xác minh tài khoản chủ nhà, giống cách Airbnb thu thập thông tin thuế trước khi
              cho phép nhận thanh toán.
            </p>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-neutral-500">Trạng thái xác minh:</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.text}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Họ và tên đầy đủ (theo giấy tờ tuỳ thân) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                Mã số thuế <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="VD: 0123456789"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
              <p className="mt-1.5 text-xs text-neutral-400">Mã số thuế cá nhân hoặc mã số thuế hộ kinh doanh/doanh nghiệp.</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-3">Loại hình nộp thuế</label>
              <div className="space-y-2">
                {TAXPAYER_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      taxpayerType === t.value ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="taxpayerType"
                      value={t.value}
                      checked={taxpayerType === t.value}
                      onChange={(e) => setTaxpayerType(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{t.label}</p>
                      <p className="text-xs text-neutral-500">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">Số CCCD/CMND (không bắt buộc)</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="079xxxxxxxxx"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              Đây là dự án học tập — thông tin nhập ở đây không phải tư vấn pháp lý/thuế chính thức.
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
