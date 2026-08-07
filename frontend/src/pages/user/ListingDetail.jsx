import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Seo from '../../components/common/Seo';
import Gallery from '../../components/listing/Gallery';
import AmenityList from '../../components/listing/AmenityList';
import BookingWidget from '../../components/listing/BookingWidget';
import api from '../../services/api';

async function fetchListing(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data.data;
}

async function fetchCalendar(listingId, year, month) {
  const { data } = await api.get(`/calendar/${listingId}`, { params: { year, month } });
  return data.data;
}

function AvailabilityCalendar({ listingId, checkIn, checkOut, onSelectDate }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data: bookedDays = [] } = useQuery({
    queryKey: ['calendar', listingId, year, month],
    queryFn: () => fetchCalendar(listingId, year, month),
  });

  const bookedSet = new Set(
    bookedDays.map((d) => new Date(d.date).toISOString().split('T')[0])
  );

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function handleClickDay(dateStr, isPast, isBooked) {
    if (isPast || isBooked) return;
    onSelectDate(dateStr);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(year, month - 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="border-t border-neutral-200 py-8">
      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Lịch trống phòng</h2>
      <p className="text-sm text-neutral-500 mb-4">Click vào ngày để chọn ngày nhận / trả phòng</p>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-600">‹</button>
        <span className="font-medium text-neutral-800 capitalize">{monthLabel}</span>
        <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-600">›</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-neutral-500 mb-2">
        {['CN','T2','T3','T4','T5','T6','T7'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm text-center">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isPast = dateStr < todayStr;
          const isBooked = bookedSet.has(dateStr);
          const isToday = dateStr === todayStr;
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
          const isSelectable = !isPast && !isBooked;

          return (
            <div
              key={dateStr}
              onClick={() => handleClickDay(dateStr, isPast, isBooked)}
              title={isBooked ? 'Đã có khách đặt' : isPast ? 'Đã qua' : 'Click để chọn'}
              className={[
                'py-1.5 rounded-full text-sm font-medium transition-colors',
                isSelectable ? 'cursor-pointer' : 'cursor-default',
                isCheckIn || isCheckOut ? 'bg-teal-600 text-white' : '',
                isInRange ? 'bg-teal-100 text-teal-700' : '',
                isBooked ? 'bg-red-100 text-red-400 line-through' : '',
                isToday && !isCheckIn && !isCheckOut ? 'ring-2 ring-teal-500' : '',
                isPast && !isBooked ? 'text-neutral-300' : '',
                !isPast && !isBooked && !isCheckIn && !isCheckOut && !isInRange
                  ? 'text-neutral-700 hover:bg-neutral-100' : '',
              ].join(' ')}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> Ngày đã chọn</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-100 inline-block" /> Đã đặt</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-neutral-300 inline-block" /> Còn trống</span>
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id),
  });

  function handleSelectDate(dateStr) {
    if (!checkIn || (checkIn && checkOut)) {
      // Chưa có checkIn hoặc đã chọn cả 2 → reset, chọn checkIn mới
      setCheckIn(dateStr);
      setCheckOut('');
    } else if (dateStr <= checkIn) {
      // Chọn ngày trước checkIn → đặt làm checkIn mới
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      // Có checkIn rồi → chọn checkOut
      setCheckOut(dateStr);
    }
  }

  if (isLoading) return <p className="text-center py-24 text-neutral-400">Đang tải...</p>;

  if (isError || !listing) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Không tìm thấy chỗ ở này</h1>
        <p className="mt-2 text-neutral-500">Chỗ ở có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <Link to="/" className="mt-6 inline-block text-teal-600 underline">Về trang chủ</Link>
      </main>
    );
  }

  const images = listing.images?.map((img) => img.imageUrl) ?? [];
  const amenityKeys = listing.amenities?.map((a) => a.amenity) ?? [];

  return (
    <>
      <Seo title={listing.title} description={listing.description} path={`/listings/${listing.id}`} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{listing.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 underline">{listing.address}</p>

        <div className="mt-4">
          <Gallery images={images} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-0">
            <div className="border-b border-neutral-200 pb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Chủ nhà: {listing.host?.fullName}</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {listing.guestCapacity} khách · {listing.bedrooms} phòng ngủ · {listing.beds} giường · {listing.bathrooms} phòng tắm
              </p>
            </div>

            {listing.description && (
              <div className="border-b border-neutral-200 py-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Mô tả</h2>
                <p className="text-neutral-600 whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            <AmenityList amenities={amenityKeys} />

            <AvailabilityCalendar
              listingId={listing.id}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDate={handleSelectDate}
            />
          </div>

          <div className="lg:col-span-1">
            <BookingWidget
              listing={listing}
              checkIn={checkIn}
              checkOut={checkOut}
              onChangeCheckIn={setCheckIn}
              onChangeCheckOut={setCheckOut}
            />
          </div>
        </div>
      </main>
    </>
  );
}
