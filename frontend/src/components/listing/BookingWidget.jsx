import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { createBooking } from '../../services/bookingService';
import { guestLogin } from '../../services/authService';
import api from '../../services/api';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
});

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function BookingWidget({ listing, checkIn, checkOut, onChangeCheckIn, onChangeCheckOut }) {
  const { user, login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      contactName: user?.fullName ?? '',
      contactEmail: user?.email ?? '',
    },
  });

  const nights = calcNights(checkIn, checkOut);
  const total = nights * Number(listing.defaultPrice);

  const mutation = useMutation({
    mutationFn: async (values) => {
      let token = user ? localStorage.getItem('token') : null;

      // Chưa đăng nhập → tạo tài khoản guest rồi lấy token
      if (!user) {
        const { user: guestUser, token: guestToken } = await guestLogin({
          email: values.contactEmail,
          fullName: values.contactName,
          phone: values.contactPhone,
        });
        authLogin(guestUser, guestToken);
        token = guestToken;
      }

      // Gọi API đặt phòng với token (set thẳng vào header nếu cần)
      const { data } = await api.post('/bookings', {
        listingId: listing.id,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data;
    },
    onSuccess: (booking) => {
      navigate(`/bookings/${booking.id}/payment`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Đặt phòng thất bại'),
  });

  function onSubmit(values) {
    mutation.mutate({ ...values });
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="sticky top-24 rounded-2xl border border-neutral-200 p-6 shadow-md">
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-neutral-900">
          {currencyFormatter.format(listing.defaultPrice)}
        </span>
        <span className="text-neutral-500 text-sm">/ đêm</span>
      </div>

      {!showForm ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="border border-neutral-300 rounded-lg p-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase">Nhận phòng</p>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => onChangeCheckIn(e.target.value)}
                className="w-full text-sm text-neutral-900 outline-none mt-0.5"
              />
            </div>
            <div className="border border-neutral-300 rounded-lg p-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase">Trả phòng</p>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => onChangeCheckOut(e.target.value)}
                className="w-full text-sm text-neutral-900 outline-none mt-0.5"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!checkIn || !checkOut) { toast.error('Vui lòng chọn ngày nhận và trả phòng'); return; }
              if (nights < 1) { toast.error('Ngày trả phòng phải sau ngày nhận phòng'); return; }
              setShowForm(true);
            }}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Đặt phòng
          </button>

          {nights > 0 && (
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="flex justify-between">
                <span>{currencyFormatter.format(listing.defaultPrice)} × {nights} đêm</span>
                <span>{currencyFormatter.format(total)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-neutral-200 pt-2">
                <span>Tổng cộng</span>
                <span>{currencyFormatter.format(total)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-700 flex justify-between">
            <span>{checkIn} → {checkOut}</span>
            <span className="font-semibold">{nights} đêm · {currencyFormatter.format(total)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Họ tên *</label>
            <input
              {...register('contactName', { required: 'Bắt buộc' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
            <input
              type="email"
              {...register('contactEmail', { required: 'Bắt buộc' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Số điện thoại</label>
            <input
              {...register('contactPhone')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0901234567"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Quay lại
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {mutation.isPending ? 'Đang đặt...' : 'Xác nhận đặt phòng'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
