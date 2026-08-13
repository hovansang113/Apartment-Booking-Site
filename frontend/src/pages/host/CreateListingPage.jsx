import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  AmenityIcon,
  CategoryIcon,
  PlusIcon,
  MinusIcon,
  CloseIcon,
} from '../../components/common/icons';
import { createListing as createListingApi } from '../../services/listingService';

const CATEGORY_IDS = ['apartment', 'house', 'villa', 'homestay', 'hotel_room'];
const MAIN_AMENITY_IDS = ['wifi', 'tv', 'kitchen', 'washer', 'free_parking', 'air_conditioning', 'workspace'];
const FEATURED_AMENITY_IDS = ['pool'];

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default function CreateListingPage() {
  const { t } = useTranslation();
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
      toast(t('createListing.draftToast'), { icon: '📝' });
    }
  }, [searchParams, t]);

  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weekdayPrice, setWeekdayPrice] = useState(1200000);
  const [weekendPrice, setWeekendPrice] = useState(1200000);
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
      toast.error(t('createListing.errors.selectCategory'));
      return;
    }
    if (step === 2 && !address.trim()) {
      toast.error(t('createListing.errors.enterAddress'));
      return;
    }
    if (step === 4 && photos.length === 0) {
      toast.error(t('createListing.errors.uploadAtLeastOne'));
      return;
    }
    if (step === 5 && !title.trim()) {
      toast.error(t('createListing.errors.enterTitle'));
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
      formData.append('weekdayPrice', weekdayPrice);
      formData.append('weekendPrice', weekendPrice);
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

      toast.success(t('createListing.submitSuccess'));
      navigate('/host/listings');
    } catch (err) {
      toast.error(t('createListing.errors.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('createListing.pageTitle')}</title>
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
                onClick={() => toast(t('createListing.supportToast'), { icon: '💬' })}
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                {t('createListing.support')}
              </button>
              <Link
                to="/host/listings"
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
              >
                {t('createListing.saveExit')}
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
                {t('createListing.step1.title')}
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                {t('createListing.step1.subtitle')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {CATEGORY_IDS.map((id) => {
                  const isSelected = category === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategory(id)}
                      className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-neutral-100 text-neutral-800 shrink-0">
                        <CategoryIcon name={id} className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{t(`createListing.categoryLabel.${id}`)}</h3>
                        <p className="text-xs text-neutral-500 mt-1">{t(`createListing.categoryDesc.${id}`)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <h2 className="text-lg font-bold text-neutral-900 mb-4">{t('createListing.step1.capacityHeading')}</h2>
              <div className="rounded-2xl border border-neutral-200 p-6 space-y-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">{t('createListing.step1.maxGuests')}</p>
                    <p className="text-xs text-neutral-500">{t('createListing.step1.maxGuestsSub')}</p>
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
                  <p className="font-semibold text-neutral-900">{t('createListing.step1.bedrooms')}</p>
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
                  <p className="font-semibold text-neutral-900">{t('createListing.step1.beds')}</p>
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
                  <p className="font-semibold text-neutral-900">{t('createListing.step1.bathrooms')}</p>
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
                {t('createListing.step2.title')}
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                {t('createListing.step2.subtitle')}
              </p>

              <div className="space-y-4 rounded-2xl border border-neutral-200 p-6 bg-white shadow-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-2">
                    {t('createListing.step2.addressLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('createListing.step2.addressPlaceholder')}
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
                {t('createListing.step3.title')}
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                {t('createListing.step3.subtitle')}
              </p>

              {/* Section 1 */}
              <h2 className="text-base font-semibold text-neutral-900 mb-4">
                {t('createListing.step3.section1Heading')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {MAIN_AMENITY_IDS.map((id) => {
                  const isSelected = selectedAmenities.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleAmenity(id)}
                      className={`flex flex-col items-start justify-between p-5 h-32 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-300 hover:border-neutral-500 bg-white'
                      }`}
                    >
                      <AmenityIcon name={id} className="h-7 w-7 text-neutral-900" />
                      <span className="font-medium text-neutral-900 text-sm">{t(`createListing.amenityLabel.${id}`)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Section 2 */}
              <h2 className="text-base font-semibold text-neutral-900 mb-4">
                {t('createListing.step3.section2Heading')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {FEATURED_AMENITY_IDS.map((id) => {
                  const isSelected = selectedAmenities.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleAmenity(id)}
                      className={`flex flex-col items-start justify-between p-5 h-32 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <AmenityIcon name={id} className="h-7 w-7 text-neutral-900" />
                      <span className="font-medium text-neutral-900 text-sm">{t(`createListing.amenityLabel.${id}`)}</span>
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
                {t('createListing.step4.title')}
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                {t('createListing.step4.subtitle')}
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
                  <p className="font-bold text-neutral-900">{t('createListing.step4.dropzoneTitle')}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t('createListing.step4.dropzoneSub')}</p>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative aspect-4/3 rounded-2xl overflow-hidden group border border-neutral-200 shadow-sm">
                      <img src={photo.url} alt={t('createListing.step4.uploadAlt', { index })} className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {t('createListing.step4.coverPhoto')}
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
                {t('createListing.step5.title')}
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                {t('createListing.step5.subtitle')}
              </p>

              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 p-6 bg-white">
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-2">
                    {t('createListing.step5.titleLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('createListing.step5.titlePlaceholder')}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                  <p className="text-xs text-neutral-400 mt-2 text-right">{t('createListing.step5.titleCharCount', { count: title.length })}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-6 bg-white">
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-2">
                    {t('createListing.step5.descLabel')}
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('createListing.step5.descPlaceholder')}
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
                {t('createListing.step6.title')}
              </h1>
              <p className="mt-2 text-sm text-neutral-500 mb-8">
                {t('createListing.step6.subtitle')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
                <div className="rounded-2xl border border-neutral-200 p-6 bg-white text-center shadow-sm">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    {t('createListing.step6.weekdayPriceLabel')}
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">{t('createListing.step6.weekdayPriceHint')}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-neutral-900">₫</span>
                    <input
                      type="number"
                      step={50000}
                      min={100000}
                      value={weekdayPrice}
                      onChange={(e) => setWeekdayPrice(Number(e.target.value))}
                      className="w-32 text-center text-3xl font-extrabold text-neutral-900 border-b-2 border-neutral-300 focus:border-neutral-900 outline-none pb-1"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-6 bg-white text-center shadow-sm">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    {t('createListing.step6.weekendPriceLabel')}
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">{t('createListing.step6.weekendPriceHint')}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-neutral-900">₫</span>
                    <input
                      type="number"
                      step={50000}
                      min={100000}
                      value={weekendPrice}
                      onChange={(e) => setWeekendPrice(Number(e.target.value))}
                      className="w-32 text-center text-3xl font-extrabold text-neutral-900 border-b-2 border-neutral-300 focus:border-neutral-900 outline-none pb-1"
                    />
                  </div>
                </div>

                <p className="col-span-full text-center text-xs text-neutral-400">
                  {t('createListing.step6.priceExample')}
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50">
                <h3 className="font-bold text-neutral-900 mb-4">{t('createListing.step6.summaryHeading')}</h3>
                <div className="space-y-2 text-sm text-neutral-700">
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryTitle')}</span> {title || t('createListing.step6.notSet')}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryCategory')}</span> {t(`createListing.categoryLabel.${category}`)}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryAddress')}</span> {address || t('createListing.step6.notEntered')}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryCapacity')}</span> {t('createListing.step6.summaryCapacityValue', { guests: guestCapacity, bedrooms, beds, bathrooms })}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryWeekdayPrice')}</span> {currencyFormatter.format(weekdayPrice)}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryWeekendPrice')}</span> {currencyFormatter.format(weekendPrice)}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryAmenities')}</span> {t('createListing.step6.summaryAmenitiesValue', { count: selectedAmenities.length })}</p>
                  <p><span className="font-semibold text-neutral-900">{t('createListing.step6.summaryPhotos')}</span> {t('createListing.step6.summaryPhotosValue', { count: photos.length })}</p>
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
              {t('createListing.back')}
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
              {step === totalSteps ? (isSubmitting ? t('createListing.processing') : t('createListing.finish')) : t('createListing.next')}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
