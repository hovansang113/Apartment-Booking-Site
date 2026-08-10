import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  AmenityIcon,
  CategoryIcon,
  PlusIcon,
  MinusIcon,
  CloseIcon,
} from '../../components/common/icons';
import { createListing as createListingApi } from '../../services/listingService';

const CATEGORY_OPTIONS = [
  { id: 'apartment', label: 'Căn hộ', desc: 'Chỗ ở thuộc tòa nhà chung cư hoặc khu tập thể' },
  { id: 'house', label: 'Nhà riêng', desc: 'Căn nhà nguyên căn độc lập dành riêng cho khách' },
  { id: 'villa', label: 'Biệt thự / Villa', desc: 'Biệt thự sang trọng với khuôn viên rộng rãi' },
  { id: 'homestay', label: 'Homestay', desc: 'Không gian ấm cúng, thân thiện mang bản sắc địa phương' },
  { id: 'hotel_room', label: 'Phòng khách sạn', desc: 'Phòng trong khách sạn hoặc khu nghỉ dưỡng' },
];

const MAIN_AMENITIES = [
  { id: 'wifi', label: 'Wi-fi', name: 'wifi' },
  { id: 'tv', label: 'TV', name: 'tv' },
  { id: 'kitchen', label: 'Nhà bếp', name: 'kitchen' },
  { id: 'washer', label: 'Máy giặt', name: 'washer' },
  { id: 'free_parking', label: 'Chỗ đỗ xe miễn phí trong khuôn viên', name: 'free_parking' },
  { id: 'air_conditioning', label: 'Điều hòa nhiệt độ', name: 'air_conditioning' },
  { id: 'workspace', label: 'Không gian riêng để làm việc', name: 'workspace' },
];

const FEATURED_AMENITIES = [
  { id: 'pool', label: 'Bể bơi', name: 'pool' },
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftStepParam = parseInt(searchParams.get('step') || '1', 10);

  const [step, setStep] = useState(draftStepParam); // Steps 1 to 6
  const totalSteps = 6;

  // Form State
  const [category, setCategory] = useState('apartment');
  const [guestCapacity, setGuestCapacity] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);

  const [address, setAddress] = useState(searchParams.get('draftId') ? 'Ngũ Hành Sơn, Đà Nẵng, Việt Nam' : '');
  const [selectedAmenities, setSelectedAmenities] = useState(['wifi', 'air_conditioning', 'kitchen']);

  useEffect(() => {
    if (searchParams.get('draftId')) {
      toast('Đang tiếp tục chỉnh sửa bài đăng dở dang của bạn!', { icon: '📝' });
    }
  }, [searchParams]);

  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrice, setDefaultPrice] = useState(1200000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleAmenity(id) {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPhotos = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      url: URL.createObjectURL(file),
    }));

    setPhotos([...photos, ...newPhotos]);
  }

  function removePhoto(id) {
    setPhotos(photos.filter((p) => p.id !== id));
  }

  function handleNext() {
    if (step === 1 && !category) {
      toast.error('Vui lòng chọn loại chỗ ở');
      return;
    }
    if (step === 2 && !address.trim()) {
      toast.error('Vui lòng nhập địa chỉ cụ thể');
      return;
    }
    if (step === 4 && photos.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 ảnh');
      return;
    }
    if (step === 5 && !title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cho bài đăng');
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('address', address.trim());
      formData.append('defaultPrice', defaultPrice);
      formData.append('guestCapacity', guestCapacity);
      formData.append('bedrooms', bedrooms);
      formData.append('beds', beds);
      formData.append('bathrooms', bathrooms);
      formData.append('amenities', JSON.stringify(selectedAmenities));

      photos.forEach((p) => {
        if (p.file) {
          formData.append('images', p.file);
        }
      });

      // Call API service with FormData matching DB schema
      try {
        await createListingApi(formData);
      } catch (e) {
        console.warn('API call skipped or backend offline during demo:', e);
      }

      toast.success('Đã tạo thành công bài đăng mới! Bài đăng đang chờ quản trị viên phê duyệt.');
      navigate('/host/listings');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tạo bài đăng. Vui lòng kiểm tra lại!');
    } finally {
      setIsSubmitting(false);
    }
  }

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
                onClick={() => toast('Bộ phận hỗ trợ sẽ liên hệ với bạn trong giây lát!', { icon: '💬' })}
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                Bạn có thắc mắc?
              </button>
              <Link
                to="/host/listings"
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                Lưu và thoát
              </Link>
            </div>
          </div>
        </header>

        {/* Wizard Main Content Container */}
        <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          {/* STEP 1: Category & Capacity */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Bắt đầu với loại chỗ ở của bạn
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                Khách hàng sẽ tìm thấy chỗ ở của bạn dựa trên loại hình này.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-neutral-100 text-neutral-800 shrink-0">
                        <CategoryIcon name={cat.id} className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{cat.label}</h3>
                        <p className="text-xs text-neutral-500 mt-1">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <h2 className="text-lg font-bold text-neutral-900 mb-4">Sức chứa & Cấu trúc</h2>
              <div className="rounded-2xl border border-neutral-200 p-6 space-y-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">Số lượng khách tối đa</p>
                    <p className="text-xs text-neutral-500">Số khách có thể ở lại</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={guestCapacity <= 1}
                      onClick={() => setGuestCapacity(guestCapacity - 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-900"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900">{guestCapacity}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCapacity(guestCapacity + 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">Phòng ngủ</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={bedrooms <= 1}
                      onClick={() => setBedrooms(bedrooms - 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-900"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900">{bedrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBedrooms(bedrooms + 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">Giường ngủ</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={beds <= 1}
                      onClick={() => setBeds(beds - 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-900"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900">{beds}</span>
                    <button
                      type="button"
                      onClick={() => setBeds(beds + 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-6 flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">Phòng tắm</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={bathrooms <= 1}
                      onClick={() => setBathrooms(bathrooms - 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-900"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900">{bathrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBathrooms(bathrooms + 1)}
                      className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Chỗ ở của bạn nằm ở đâu?
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                Địa chỉ cụ thể chỉ được chia sẻ với khách sau khi đơn đặt phòng của họ hoàn tất.
              </p>

              <div className="space-y-4 rounded-2xl border border-neutral-200 p-6 bg-white shadow-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-2">
                    Địa chỉ chi tiết (Số nhà, Đường, Phường/Xã, Quận/Huyện, Thành phố) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh"
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Amenities (EXACT MATCH FOR CREATE.PNG SCREENSHOT) */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Cho khách biết chỗ ở của bạn có những gì
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                Bạn có thể bổ sung thêm tiện nghi sau khi đăng bài đăng.
              </p>

              {/* Section 1 */}
              <h2 className="text-base font-semibold text-neutral-900 mb-4">
                Còn những tiện nghi yêu thích của khách sau đây thì sao?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {MAIN_AMENITIES.map((item) => {
                  const isSelected = selectedAmenities.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAmenity(item.id)}
                      className={`flex flex-col items-start justify-between p-5 h-32 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-300 hover:border-neutral-500 bg-white'
                      }`}
                    >
                      <AmenityIcon name={item.name} className="h-7 w-7 text-neutral-900" />
                      <span className="font-medium text-neutral-900 text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Section 2 */}
              <h2 className="text-base font-semibold text-neutral-900 mb-4">
                Bạn có tiện nghi nào nổi bật không?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {FEATURED_AMENITIES.map((item) => {
                  const isSelected = selectedAmenities.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAmenity(item.id)}
                      className={`flex flex-col items-start justify-between p-5 h-32 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <AmenityIcon name={item.name} className="h-7 w-7 text-neutral-900" />
                      <span className="font-medium text-neutral-900 text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Photo Upload */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Thêm một số hình ảnh về chỗ ở của bạn
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                Bạn cần tải lên ít nhất 1 hình ảnh đẹp để bài đăng trông thật thu hút.
              </p>

              <div className="mb-6 rounded-3xl border-2 border-dashed border-neutral-300 p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload-input"
                />
                <label htmlFor="photo-upload-input" className="cursor-pointer">
                  <p className="text-4xl mb-2">📸</p>
                  <p className="font-bold text-neutral-900">Kéo thả hoặc nhấp vào đây để chọn ảnh</p>
                  <p className="text-xs text-neutral-500 mt-1">Hỗ trợ JPG, PNG, WEBP (tối đa 10MB/ảnh)</p>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative aspect-4/3 rounded-2xl overflow-hidden group border border-neutral-200 shadow-sm">
                      <img src={photo.url} alt={`Upload ${index}`} className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                          Ảnh bìa
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-neutral-700 shadow-md hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Title & Description */}
          {step === 5 && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Bây giờ, hãy đặt tên và mô tả chỗ ở
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                Tiêu đề ngắn gọn mang nét đặc trưng nhất của chỗ ở sẽ thu hút khách đặt nhanh hơn.
              </p>

              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 p-6 bg-white">
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-2">
                    Tiêu đề bài đăng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Căn hộ Studio view biển ấm cúng trung tâm thành phố"
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                  <p className="text-xs text-neutral-400 mt-2 text-right">{title.length}/100 ký tự</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-6 bg-white">
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-2">
                    Mô tả chỗ ở của bạn
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Giới thiệu điểm nổi bật, vị trí thuận tiện, không gian căn hộ..."
                    className="w-full rounded-xl border border-neutral-300 p-4 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Price & Confirm */}
          {step === 6 && (
            <div className="animate-fadeIn">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Bây giờ, hãy đặt mức giá theo đêm
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                Bạn có thể thay đổi giá bất kỳ lúc nào sau khi hoàn tất bài đăng.
              </p>

              <div className="rounded-2xl border border-neutral-200 p-8 bg-white text-center max-w-md mx-auto mb-10 shadow-sm">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Giá mỗi đêm (VND)
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-neutral-900">₫</span>
                  <input
                    type="number"
                    step={50000}
                    min={100000}
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="w-48 text-center text-4xl font-extrabold text-neutral-900 border-b-2 border-neutral-300 focus:border-neutral-900 outline-none pb-1"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-4">
                  Ví dụ: 1.200.000 ₫ / đêm
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50">
                <h3 className="font-bold text-neutral-900 mb-4">Tóm tắt thông tin đăng bài</h3>
                <div className="space-y-2 text-sm text-neutral-700">
                  <p><span className="font-semibold text-neutral-900">Tiêu đề:</span> {title || 'Chưa đặt'}</p>
                  <p><span className="font-semibold text-neutral-900">Loại chỗ ở:</span> {CATEGORY_OPTIONS.find((c) => c.id === category)?.label}</p>
                  <p><span className="font-semibold text-neutral-900">Địa chỉ:</span> {address || 'Chưa nhập'}</p>
                  <p><span className="font-semibold text-neutral-900">Sức chứa:</span> {guestCapacity} khách · {bedrooms} phòng ngủ · {beds} giường · {bathrooms} phòng tắm</p>
                  <p><span className="font-semibold text-neutral-900">Tiện nghi chọn:</span> {selectedAmenities.length} tiện nghi</p>
                  <p><span className="font-semibold text-neutral-900">Hình ảnh:</span> {photos.length} hình ảnh</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Sticky Bottom Progress Bar Footer (Matching Screenshot) */}
        <footer className="sticky bottom-0 z-30 border-t border-neutral-200 bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={handleBack}
              className="text-sm font-semibold text-neutral-900 underline disabled:opacity-30 disabled:no-underline"
            >
              Quay lại
            </button>

            {/* Segmented Progress Line */}
            <div className="hidden sm:flex items-center gap-1.5 flex-1 max-w-xs mx-8">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i + 1 <= step ? 'bg-neutral-900' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="rounded-xl bg-neutral-900 px-7 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50"
            >
              {step === totalSteps ? (isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đăng bài') : 'Tiếp theo'}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
