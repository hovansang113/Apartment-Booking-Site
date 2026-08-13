import api from './api';

// Chuyen shape tu backend (REQ_05/06) sang shape cac component dang dung san
// (truoc day dua theo mockListings.js). Khong co he thong review/rating that
// (khong co REQ, khong co bang DB) nen rating luon la null - cac component
// phai tu an di neu null, khong duoc bia so gia.
function mapListing(raw) {
  const imageUrls = (raw.images || []).map((img) => img.imageUrl);
  const weekdayPrice = Number(raw.weekdayPrice);
  const weekendPrice = Number(raw.weekendPrice);
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    address: raw.address,
    // "Tu X/dem" tren card/list - gia thap nhat trong 2 muc (REQ_13). Gia
    // that theo tung dem tinh o BookingWidget bang weekdayPrice/weekendPrice.
    pricePerNight: Math.min(weekdayPrice, weekendPrice),
    weekdayPrice,
    weekendPrice,
    rating: null,
    guestCapacity: raw.guestCapacity,
    bedrooms: raw.bedrooms,
    beds: raw.beds,
    bathrooms: raw.bathrooms,
    amenities: (raw.amenities || []).map((a) => a.amenity),
    host: raw.host ? { name: raw.host.fullName, isSuperhost: false } : null,
    image: imageUrls[0],
    images: imageUrls,
  };
}

// REQ_05 - de loi bubble len react-query (khong tu nuot loi) de Home.jsx phan
// biet duoc "API that su loi" (fallback mock cho de dev) voi "API tra ve rong
// vi chua co listing that nao duoc duyet" (phai hien dung trang thai rong,
// khong duoc bia du lieu gia).
export async function getPublicListings({ category, page } = {}) {
  const { data } = await api.get('/listings', { params: { category, page } });
  return { listings: data.data.listings.map(mapListing), total: data.data.total };
}

// REQ_06
export async function getListingById(id) {
  const { data } = await api.get(`/listings/${id}`);
  return mapListing(data.data);
}

export async function getHostListings() {
  const { data } = await api.get('/listings/mine');
  return data.data;
}

export async function createListing(formData) {
  const { data } = await api.post('/listings', formData);
  return data.data;
}

export async function updateListing(id, payload) {
  const { data } = await api.put(`/listings/${id}`, payload);
  return data.data;
}

export async function deleteListing(id) {
  const { data } = await api.delete(`/listings/${id}`);
  return data.data;
}
