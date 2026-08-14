import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

async function fetchMe() {
  const { data } = await api.get('/users/me');
  return data.data;
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: profile } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setForm({ fullName: profile.fullName, phone: profile.phone || '' });
    setInitialized(true);
  }

  const updateProfile = useMutation({
    mutationFn: (values) => api.patch('/users/me', values),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['me']);
      // Sync AuthContext so Header avatar/name updates immediately
      login(data.data, localStorage.getItem('token'));
    },
  });

  const updateAvatar = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return api.patch('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['me']);
      login(data.data, localStorage.getItem('token'));
    },
  });

  const changePassword = useMutation({
    mutationFn: (values) => api.patch('/users/me/password', values),
    onSuccess: () => setPwForm({ currentPassword: '', newPassword: '', confirm: '' }),
  });

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (file) updateAvatar.mutate(file);
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    updateProfile.mutate({ fullName: form.fullName, phone: form.phone });
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    changePassword.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  }

  const avatar = profile?.avatarUrl || user?.avatarUrl;
  const initials = (profile?.fullName || user?.fullName || '?')[0].toUpperCase();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Edit Profile</h1>

      {/* Avatar */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Profile photo</h2>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group shrink-0"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="h-20 w-20 rounded-full object-cover ring-2 ring-neutral-200" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-neutral-200">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
              Change
            </div>
          </button>
          <div>
            <p className="text-sm text-neutral-600">Click the photo to upload a new one.</p>
            <p className="text-xs text-neutral-400 mt-1">JPG or PNG, max 5 MB. Square crop recommended.</p>
            {updateAvatar.isPending && <p className="text-xs text-teal-600 mt-1">Uploading…</p>}
            {updateAvatar.isSuccess && <p className="text-xs text-green-600 mt-1">Avatar updated!</p>}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </section>

      {/* Profile info */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Personal information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              value={profile?.email || ''}
              disabled
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Optional"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </button>
            {updateProfile.isSuccess && <span className="text-sm text-green-600">Saved!</span>}
            {updateProfile.isError && <span className="text-sm text-red-500">Failed to save.</span>}
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-4">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Current password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">New password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm new password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {changePassword.isPending ? 'Saving…' : 'Update password'}
            </button>
            {changePassword.isSuccess && <span className="text-sm text-green-600">Password updated!</span>}
            {changePassword.isError && (
              <span className="text-sm text-red-500">
                {changePassword.error?.response?.data?.message || 'Failed to update password.'}
              </span>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
