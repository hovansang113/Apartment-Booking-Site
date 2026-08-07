import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createListing } from '../../services/listingService';
import { CategoryIcon } from '../../components/common/icons';

const CATEGORIES = [
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà nguyên căn' },
  { value: 'villa', label: 'Villa' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'hotel_room', label: 'Phòng khách sạn' },
];

const AMENITIES = [
  { value: 'wifi', label: 'Wifi' },
  { value: 'kitchen', label: 'Bếp' },
  { value: 'washer', label: 'Máy giặt' },
  { value: 'air_conditioning', label: 'Điều hoà' },
  { value: 'free_parking', label: 'Đỗ xe miễn phí' },
  { value: 'pool', label: 'Hồ bơi' },
  { value: 'tv', label: 'TV' },
  { value: 'workspace', label: 'Không gian làm việc' },
];

const COUNTERS = [
  { field: 'guestCapacity', label: 'Khách' },
  { field: 'bedrooms', label: 'Phòng ngủ' },
  { field: 'beds', label: 'Giường' },
  { field: 'bathrooms', label: 'Phòng tắm' },
];

const STEP_FIELDS = [
  ['category'],
  ['address'],
  ['guestCapacity', 'bedrooms', 'beds', 'bathrooms'],
  [], // amenities — optional
  [], // images — validated separately (imageFiles.length)
  ['title'],
  [], // description — optional
  ['defaultPrice'],
  [], // review
];

const TOTAL_STEPS = STEP_FIELDS.length;

function StepShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold text-neutral-900">{title}</h1>
      {subtitle && <p className="mt-3 text-neutral-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export default function HostListingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { guestCapacity: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
  });

  const values = watch();

  function toggleAmenity(value) {
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    );
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function adjustCounter(field, delta) {
    const next = Math.max(1, Number(values[field] || 1) + delta);
    setValue(field, next, { shouldValidate: true });
  }

  async function goNext() {
    if (step === 4 && imageFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) {
      navigate('/host/listings');
      return;
    }
    setStep((s) => s - 1);
  }

  async function onSubmit(formValues) {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formValues).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      fd.append('amenities', JSON.stringify(selectedAmenities));
      imageFiles.forEach((f) => fd.append('images', f));
      await createListing(fd);
      toast.success('Tạo phòng thành công, chờ admin duyệt');
      navigate('/host/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  const categoryLabel = CATEGORIES.find((c) => c.value === values.category)?.label;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/host/listings" className="text-2xl font-bold text-brand-600">
            stayhub
          </Link>
          <Link to="/host/listings" className="text-sm font-semibold text-neutral-600 hover:underline">
            Lưu &amp; thoát
          </Link>
        </div>
        <div className="h-1 w-full bg-neutral-100">
          <div
            className="h-1 bg-brand-600 transition-all"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
        <div className="flex-1">
          {step === 0 && (
            <StepShell title="Chỗ ở của bạn thuộc loại nào?" subtitle="Chọn loại gần đúng nhất.">
              <input type="hidden" {...register('category', { required: 'Vui lòng chọn loại chỗ ở' })} />
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue('category', c.value, { shouldValidate: true })}
                    className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      values.category === c.value
                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <CategoryIcon name={c.value} className="h-7 w-7" />
                    <span className="font-medium text-neutral-900">{c.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="mt-3 text-sm text-red-500">{errors.category.message}</p>}
            </StepShell>
          )}

          {step === 1 && (
            <StepShell title="Chỗ ở của bạn ở đâu?" subtitle="Địa chỉ này chỉ hiển thị cho khách sau khi đặt phòng.">
              <input
                {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                className="w-full border-b-2 border-neutral-300 px-1 py-3 text-lg outline-none focus:border-neutral-900"
                placeholder="123 Nguyễn Văn Linh, Đà Nẵng"
              />
              {errors.address && <p className="mt-3 text-sm text-red-500">{errors.address.message}</p>}
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Chia sẻ vài thông tin cơ bản" subtitle="Bạn sẽ thêm chi tiết hơn sau.">
              <div className="divide-y divide-neutral-200">
                {COUNTERS.map((c) => (
                  <div key={c.field} className="flex items-center justify-between py-4">
                    <span className="font-medium text-neutral-900">{c.label}</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => adjustCounter(c.field, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-lg hover:border-neutral-900 disabled:opacity-30"
                        disabled={Number(values[c.field]) <= 1}
                      >
                        −
                      </button>
                      <span className="w-4 text-center">{values[c.field]}</span>
                      <button
                        type="button"
                        onClick={() => adjustCounter(c.field, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-lg hover:border-neutral-900"
                      >
                        +
                      </button>
                    </div>
                    <input type="hidden" {...register(c.field, { required: true, min: 1 })} />
                  </div>
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="Chỗ ở của bạn có gì?" subtitle="Chọn các tiện nghi bạn cung cấp cho khách.">
              <div className="grid grid-cols-2 gap-3">
                {AMENITIES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => toggleAmenity(a.value)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selectedAmenities.includes(a.value)
                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="Thêm vài bức ảnh" subtitle="Cần ít nhất 1 ảnh, bạn có thể thêm tối đa 10 ảnh.">
              <label className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center hover:border-brand-500 transition-colors">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="" className="h-24 w-full rounded-lg object-cover" />
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">Nhấn để chọn ảnh</p>
                )}
              </label>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="Đặt tiêu đề cho chỗ ở" subtitle="Tiêu đề ngắn gọn thường thu hút hơn.">
              <input
                {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
                className="w-full border-b-2 border-neutral-300 px-1 py-3 text-lg outline-none focus:border-neutral-900"
                placeholder="Căn hộ view biển Đà Nẵng"
              />
              {errors.title && <p className="mt-3 text-sm text-red-500">{errors.title.message}</p>}
            </StepShell>
          )}

          {step === 6 && (
            <StepShell title="Tạo mô tả" subtitle="Nêu bật những điểm đặc biệt của chỗ ở.">
              <textarea
                {...register('description')}
                rows={6}
                className="w-full resize-none rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900"
                placeholder="Mô tả về phòng của bạn..."
              />
            </StepShell>
          )}

          {step === 7 && (
            <StepShell title="Đặt giá cho 1 đêm" subtitle="Bạn có thể thay đổi giá này bất cứ lúc nào.">
              <div className="flex items-baseline gap-2 border-b-2 border-neutral-300 py-3">
                <span className="text-2xl text-neutral-500">₫</span>
                <input
                  type="number"
                  {...register('defaultPrice', { required: 'Bắt buộc', min: { value: 1, message: 'Phải > 0' } })}
                  className="w-full text-3xl font-semibold outline-none"
                  placeholder="500000"
                />
              </div>
              {errors.defaultPrice && <p className="mt-3 text-sm text-red-500">{errors.defaultPrice.message}</p>}
            </StepShell>
          )}

          {step === 8 && (
            <StepShell title="Xem lại và đăng tin" subtitle="Kiểm tra lại thông tin trước khi đăng.">
              <dl className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                {[
                  ['Loại chỗ ở', categoryLabel],
                  ['Địa chỉ', values.address],
                  [
                    'Sức chứa',
                    `${values.guestCapacity} khách · ${values.bedrooms} phòng ngủ · ${values.beds} giường · ${values.bathrooms} phòng tắm`,
                  ],
                  ['Tiện nghi', selectedAmenities.map((a) => AMENITIES.find((x) => x.value === a)?.label).join(', ') || 'Không có'],
                  ['Ảnh', `${imageFiles.length} ảnh`],
                  ['Tiêu đề', values.title],
                  ['Giá / đêm', values.defaultPrice ? `${Number(values.defaultPrice).toLocaleString('vi-VN')} đ` : ''],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="text-neutral-500">{label}</dt>
                    <dd className="text-right font-medium text-neutral-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-neutral-500">
                Tin đăng sẽ ở trạng thái chờ duyệt cho tới khi admin duyệt xong.
              </p>
            </StepShell>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            <button type="button" onClick={goBack} className="text-sm font-semibold text-neutral-700 underline">
              Quay lại
            </button>
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-brand-300"
              >
                {loading ? 'Đang đăng...' : 'Đăng tin'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
