import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';
import { CategoryIcon, AmenityIcon, PlusIcon, MinusIcon, ChevronLeftIcon } from '../../components/common/icons';
import { getHostListings, updateListing } from '../../services/listingService';

const CATEGORY_IDS = ['apartment', 'house', 'villa', 'homestay', 'hotel_room'];
const AMENITY_IDS = ['wifi', 'tv', 'kitchen', 'washer', 'free_parking', 'air_conditioning', 'workspace', 'pool'];

function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function Counter({ label, value, onChange, min = 1 }) {
  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-30 hover:border-neutral-900"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-bold text-neutral-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-8 w-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Sua thong tin 1 tin dang da tao (19/8) - backend PUT /listings/:id da co san
// tu truoc, chi thieu man hinh FE. Khong dung lai wizard 6 buoc cua
// CreateListingPage.jsx (danh cho tao moi + upload anh) - trang nay la 1 form
// don, chi sua field van ban/gia/tien nghi, KHONG dong cham anh (backend
// updateListing() cung khong nhan anh - xem listing.service.js).
export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({ queryKey: ['host-listings'], queryFn: getHostListings });
  const listing = listings?.find((l) => l.id === id);

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (listing && !form) {
      setForm({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || 'apartment',
        address: listing.address || '',
        weekdayPrice: Number(listing.weekdayPrice),
        weekendPrice: Number(listing.weekendPrice),
        guestCapacity: listing.guestCapacity,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        bathrooms: listing.bathrooms,
        amenities: (listing.amenities || []).map((a) => a.amenity),
      });
    }
  }, [listing, form]);

  const saveMutation = useMutation({
    mutationFn: (payload) => updateListing(id, payload),
    onSuccess: () => {
      toast.success(t('host.listings.editSuccess'));
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
      navigate('/host/listings');
    },
    onError: (err) => toast.error(errorMessage(err, t('host.listings.editErrorFallback'))),
  });

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleAmenity(id2) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(id2) ? f.amenities.filter((a) => a !== id2) : [...f.amenities, id2],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.address.trim()) {
      toast.error(t('createListing.errors.enterTitle'));
      return;
    }
    saveMutation.mutate(form);
  }

  if (isLoading || (listing && !form)) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-neutral-500">{t('common.loading')}</div>;
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-semibold text-neutral-900">{t('host.listings.editNotFound')}</p>
        <Link to="/host/listings" className="mt-4 inline-block text-sm font-semibold text-brand-600 underline">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo title={t('host.listings.editPageTitle')} noindex />

      <main className="min-h-[85vh] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link to="/host/listings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
            <ChevronLeftIcon className="h-4 w-4" />
            {t('common.back')}
          </Link>

          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t('host.listings.editHeading')}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t('host.listings.editSubheading')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-3">
                {t('createListing.step1.title')}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORY_IDS.map((id2) => (
                  <button
                    key={id2}
                    type="button"
                    onClick={() => setField('category', id2)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
                      form.category === id2 ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <CategoryIcon name={id2} className="h-5 w-5" />
                    {t(`createListing.categoryLabel.${id2}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                {t('createListing.step5.titleLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                {t('createListing.step5.descLabel')}
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 p-4 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                {t('createListing.step2.addressLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 px-5">
              <Counter label={t('createListing.step1.maxGuests')} value={form.guestCapacity} onChange={(v) => setField('guestCapacity', v)} />
              <Counter label={t('createListing.step1.bedrooms')} value={form.bedrooms} onChange={(v) => setField('bedrooms', v)} />
              <Counter label={t('createListing.step1.beds')} value={form.beds} onChange={(v) => setField('beds', v)} />
              <Counter label={t('createListing.step1.bathrooms')} value={form.bathrooms} onChange={(v) => setField('bathrooms', v)} />
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-3">
                {t('listing.amenitiesHeading')}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {AMENITY_IDS.map((id2) => (
                  <button
                    key={id2}
                    type="button"
                    onClick={() => toggleAmenity(id2)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
                      form.amenities.includes(id2) ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <AmenityIcon name={id2} className="h-5 w-5" />
                    {t(`createListing.amenityLabel.${id2}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-200 p-5">
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                  {t('createListing.step6.weekdayPriceLabel')}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-neutral-900">£</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.weekdayPrice}
                    onChange={(e) => setField('weekdayPrice', Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-5">
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1.5">
                  {t('createListing.step6.weekendPriceLabel')}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-neutral-900">£</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.weekendPrice}
                    onChange={(e) => setField('weekendPrice', Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? t('host.listings.saving') : t('host.listings.saveChanges')}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
