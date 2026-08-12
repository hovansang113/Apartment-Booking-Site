import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminListings, updateListingStatus } from '../../services/adminService';

const TABS = [
  { value: 'pending',   label: 'Pending'    },
  { value: 'approved',  label: 'Approved'   },
  { value: 'suspended', label: 'Suspended'  },
];

const STATUS_DOT  = { pending: '#A89E97', approved: '#2F4A3E', suspended: '#B85C38' };
const STATUS_TEXT = { pending: 'Pending', approved: 'Approved', suspended: 'Suspended' };

function StatusDot({ status }) {
  const color = STATUS_DOT[status] ?? '#A89E97';
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
      {STATUS_TEXT[status] ?? status}
    </span>
  );
}

function SectionNum({ n, label }) {
  return (
    <div className="flex items-baseline gap-2 mb-5">
      <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 10, color: '#DDD4C4' }}>{n}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A89E97]">{label}</span>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString('en-GB');

export default function AdminListingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', tab],
    queryFn: () => getAdminListings(tab),
  });

  const listings = data?.listings ?? [];
  const total    = data?.total ?? 0;

  const mutation = useMutation({
    mutationFn: ({ id, status, suspendReason }) => updateListingStatus(id, status, suspendReason),
    onSuccess: (_, { status }) => {
      toast.success(status === 'approved' ? 'Listing approved' : 'Listing suspended');
      qc.invalidateQueries({ queryKey: ['admin-listings'] });
      setSuspendModal(null);
      setSuspendReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
  });

  return (
    <div>
      <SectionNum n="01" label="Listings" />

      <div className="flex mb-6" style={{ borderBottom: '1px solid #DDD4C4' }}>
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="py-2.5 mr-7 text-[13px] transition-colors"
            style={{
              borderBottom: `2px solid ${tab === t.value ? '#C17A54' : 'transparent'}`,
              color: tab === t.value ? '#2A2420' : '#A89E97',
              fontWeight: tab === t.value ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-20 text-center text-sm text-[#A89E97]">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#A89E97]">No listings found</p>
      ) : (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A89E97] mb-3">{total} listing{total !== 1 ? 's' : ''}</p>
          <div style={{ border: '1px solid #DDD4C4', borderRadius: 6, backgroundColor: '#FAF6EF', overflow: 'hidden' }}>
            {listings.map((listing, i) => {
              const thumb = listing.images?.[0]?.imageUrl;
              return (
                <div key={listing.id} className="flex items-center gap-4 px-5 py-4"
                  style={{ borderTop: i > 0 ? '1px dashed #DDD4C4' : 'none' }}>
                  {thumb
                    ? <img src={thumb} alt={listing.title} className="w-20 h-14 object-cover shrink-0" style={{ borderRadius: 4 }} />
                    : <div className="w-20 h-14 shrink-0" style={{ backgroundColor: '#F0EAE0', borderRadius: 4 }} />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <p className="font-semibold text-[13px] text-[#2A2420] truncate">{listing.title}</p>
                      <StatusDot status={listing.status} />
                    </div>
                    <p className="text-[11px] text-[#A89E97] truncate">{listing.address}</p>
                    <p className="text-[11px] text-[#A89E97] mt-0.5">{listing.host?.fullName} · {listing.host?.email}</p>
                    {listing.suspendReason && (
                      <p className="text-[11px] mt-1" style={{ color: '#B85C38' }}>Reason: {listing.suspendReason}</p>
                    )}
                  </div>
                  <p className="text-[14px] font-semibold shrink-0 mr-4 text-[#6B5F58]"
                    style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                    {Number(listing.defaultPrice).toLocaleString('vi-VN')}₫<span className="text-[11px] font-normal text-[#A89E97]">/night</span>
                  </p>
                  <div className="flex gap-2 shrink-0">
                    {listing.status !== 'approved' && (
                      <button onClick={() => mutation.mutate({ id: listing.id, status: 'approved' })}
                        disabled={mutation.isPending}
                        className="text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-1.5 transition-colors disabled:opacity-50 text-[#FAF6EF]"
                        style={{ backgroundColor: '#2F4A3E', borderRadius: 4 }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#243b31'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2F4A3E'; }}
                      >
                        Approve
                      </button>
                    )}
                    {listing.status !== 'suspended' && (
                      <button onClick={() => setSuspendModal({ id: listing.id, title: listing.title })}
                        className="text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-1.5 transition-colors"
                        style={{ border: '1px solid #DDD4C4', color: '#A89E97', borderRadius: 4, backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B85C38'; e.currentTarget.style.color = '#B85C38'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DDD4C4'; e.currentTarget.style.color = '#A89E97'; }}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {suspendModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(42,36,32,0.45)' }}>
          <div className="p-6 w-full max-w-md" style={{ backgroundColor: '#FAF6EF', border: '1px solid #DDD4C4', borderRadius: 8 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A89E97] mb-1">Suspend listing</p>
            <p className="text-[14px] font-semibold text-[#2A2420] mb-4">"{suspendModal.title}"</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="Reason for suspension..."
              className="w-full px-3 py-2 text-[13px] resize-none outline-none mb-4"
              style={{ border: '1px solid #DDD4C4', borderRadius: 4, backgroundColor: '#F0EAE0', color: '#2A2420' }}
            />
            <div className="flex gap-2">
              <button onClick={() => { setSuspendModal(null); setSuspendReason(''); }}
                className="flex-1 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors text-[#6B5F58]"
                style={{ border: '1px solid #DDD4C4', borderRadius: 4 }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!suspendReason.trim()) { toast.error('Please enter a reason'); return; }
                  mutation.mutate({ id: suspendModal.id, status: 'suspended', suspendReason });
                }}
                disabled={mutation.isPending}
                className="flex-1 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#B85C38', borderRadius: 4 }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
