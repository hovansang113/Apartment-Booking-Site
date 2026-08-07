import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createListing, updateListing, getHostListings } from '../../services/listingService';

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

export default function HostListingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!isEdit) return;
    getHostListings().then((listings) => {
      const listing = listings.find((l) => l.id === id);
      if (!listing) return;
      reset({
        title: listing.title,
        description: listing.description || '',
        category: listing.category || '',
        address: listing.address,
        defaultPrice: listing.defaultPrice,
        guestCapacity: listing.guestCapacity,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        bathrooms: listing.bathrooms,
      });
      setSelectedAmenities(listing.amenities?.map((a) => a.amenity) || []);
    });
  }, [id, isEdit, reset]);

  function toggleAmenity(value) {
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function onSubmit(values) {
    if (!isEdit && imageFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }
    setLoading(true);
    console.log('values:', values);
    console.log('imageFiles:', imageFiles);
    console.log('selectedAmenities:', selectedAmenities);
    try {
      if (isEdit) {
        await updateListing(id, {
          ...values,
          defaultPrice: Number(values.defaultPrice),
          guestCapacity: Number(values.guestCapacity),
          bedrooms: Number(values.bedrooms),
          beds: Number(values.beds),
          bathrooms: Number(values.bathrooms),
          amenities: selectedAmenities,
        });
        toast.success('Đã cập nhật phòng');
      } else {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => { if (v) fd.append(k, v); });
        fd.append('amenities', JSON.stringify(selectedAmenities));
        imageFiles.forEach((f) => fd.append('images', f));
        await createListing(fd);
        toast.success('Tạo phòng thành công, chờ admin duyệt');
      }
      navigate('/host/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6 flex items-center gap-3">
        <Link to="/host/listings" className="text-gray-500 hover:text-gray-700 text-sm">← Quay lại</Link>
        <h1 className="font-bold text-gray-900">{isEdit ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng *</label>
              <input
                {...register('title', { required: 'Vui lòng nhập tên phòng' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Căn hộ view biển Đà Nẵng"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Mô tả về phòng của bạn..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
              <select
                {...register('category')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Chọn loại --</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
              <input
                {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="123 Nguyễn Văn Linh, Đà Nẵng"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Giá & sức chứa */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Giá & sức chứa</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá / đêm (đ) *</label>
                <input
                  type="number"
                  {...register('defaultPrice', { required: 'Bắt buộc', min: { value: 1, message: 'Phải > 0' } })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="500000"
                />
                {errors.defaultPrice && <p className="text-red-500 text-xs mt-1">{errors.defaultPrice.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số khách tối đa *</label>
                <input
                  type="number"
                  {...register('guestCapacity', { required: 'Bắt buộc', min: { value: 1, message: 'Phải ≥ 1' } })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="2"
                />
                {errors.guestCapacity && <p className="text-red-500 text-xs mt-1">{errors.guestCapacity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ngủ *</label>
                <input
                  type="number"
                  {...register('bedrooms', { required: 'Bắt buộc', min: { value: 1, message: 'Phải ≥ 1' } })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1"
                />
                {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giường *</label>
                <input
                  type="number"
                  {...register('beds', { required: 'Bắt buộc', min: { value: 1, message: 'Phải ≥ 1' } })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1"
                />
                {errors.beds && <p className="text-red-500 text-xs mt-1">{errors.beds.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng tắm *</label>
                <input
                  type="number"
                  {...register('bathrooms', { required: 'Bắt buộc', min: { value: 1, message: 'Phải ≥ 1' } })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1"
                />
                {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms.message}</p>}
              </div>
            </div>
          </div>

          {/* Tiện nghi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tiện nghi</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AMENITIES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => toggleAmenity(a.value)}
                  className={`text-sm py-2 px-3 rounded-lg border transition-colors ${
                    selectedAmenities.includes(a.value)
                      ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ảnh — chỉ khi tạo mới */}
          {!isEdit && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Ảnh phòng *</h2>
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 transition-colors">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nhấn để chọn ảnh (tối đa 10 ảnh)</p>
                )}
              </label>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to="/host/listings"
              className="flex-1 text-center border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              Huỷ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
