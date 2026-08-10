// TEMP: du lieu mau de dung giao dien. Xoa file nay khi REQ_05/06
// (GET /api/listings, GET /api/listings/:id) da xong va cac trang chuyen
// sang goi listingService that.

const GALLERY_POOL = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=60',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=60',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=60',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=60',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=60',
];

function gallery(cover) {
  return [cover.replace('w=800', 'w=1200'), ...GALLERY_POOL];
}

export const mockListings = [
  {
    id: 'mock-1',
    title: 'Căn hộ view sông Hàn',
    address: 'Hải Châu, Đà Nẵng',
    category: 'apartment',
    pricePerNight: 850000,
    rating: 4.92,
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'air_conditioning', 'washer'],
    description:
      'Căn hộ nằm ngay mặt sông Hàn, ban công riêng nhìn toàn cảnh cầu Rồng về đêm. Cách bãi biển Mỹ Khê 10 phút đi xe, gần khu ẩm thực và trung tâm thành phố.',
    host: { name: 'Anh Minh', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-2',
    title: 'Nhà nguyên căn gần biển',
    address: 'Mỹ Khê, Đà Nẵng',
    category: 'house',
    pricePerNight: 1450000,
    rating: 4.85,
    guestCapacity: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ['wifi', 'kitchen', 'free_parking', 'tv'],
    description:
      'Nhà nguyên căn 2 tầng cách bãi biển Mỹ Khê 3 phút đi bộ, sân trước rộng rãi, phù hợp cho nhóm bạn hoặc gia đình đông người.',
    host: { name: 'Chị Lan', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-3',
    title: 'Biệt thự hồ bơi riêng',
    address: 'Đà Lạt, Lâm Đồng',
    category: 'villa',
    pricePerNight: 3200000,
    rating: 4.98,
    guestCapacity: 10,
    bedrooms: 5,
    beds: 6,
    bathrooms: 4,
    amenities: ['wifi', 'kitchen', 'pool', 'free_parking', 'tv', 'workspace'],
    description:
      'Biệt thự phong cách hiện đại giữa đồi thông, hồ bơi nước ấm riêng biệt, sân vườn BBQ. Không gian lý tưởng cho retreat công ty hoặc họp mặt gia đình.',
    host: { name: 'Anh Khoa', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-4',
    title: 'Homestay phong cách Nhật',
    address: 'Hội An, Quảng Nam',
    category: 'homestay',
    pricePerNight: 620000,
    rating: 4.9,
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['wifi', 'air_conditioning', 'workspace'],
    description:
      'Homestay tối giản kiểu Nhật ngay gần phố cổ Hội An, đi bộ 5 phút ra sông Hoài. Không gian yên tĩnh, phù hợp cho cặp đôi hoặc khách du lịch một mình.',
    host: { name: 'Chị Yến', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-5',
    title: 'Phòng khách sạn trung tâm',
    address: 'Quận 1, TP. Hồ Chí Minh',
    category: 'hotel_room',
    pricePerNight: 980000,
    rating: 4.7,
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['wifi', 'air_conditioning', 'tv'],
    description:
      'Phòng khách sạn ngay trung tâm Quận 1, đi bộ tới phố đi bộ Nguyễn Huệ và chợ Bến Thành. Dọn phòng hàng ngày, lễ tân 24/7.',
    host: { name: 'Khách sạn Riverside', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-6',
    title: 'Căn hộ studio hiện đại',
    address: 'Ba Đình, Hà Nội',
    category: 'apartment',
    pricePerNight: 720000,
    rating: 4.8,
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'washer', 'workspace'],
    description:
      'Studio nhỏ gọn, đầy đủ nội thất, gần Hồ Tây và Lăng Bác. Phù hợp cho khách công tác ngắn ngày.',
    host: { name: 'Anh Tuấn', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-7',
    title: 'Nhà gỗ giữa rừng thông',
    address: 'Sa Pa, Lào Cai',
    category: 'house',
    pricePerNight: 1100000,
    rating: 4.95,
    guestCapacity: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'free_parking'],
    description:
      'Nhà gỗ ấm cúng giữa rừng thông, view thung lũng Mường Hoa. Có lò sưởi, phù hợp nghỉ dưỡng mùa đông.',
    host: { name: 'Anh Sùng', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-8',
    title: 'Villa sát bãi biển',
    address: 'Phú Quốc, Kiên Giang',
    category: 'villa',
    pricePerNight: 4500000,
    rating: 5,
    guestCapacity: 12,
    bedrooms: 6,
    beds: 7,
    bathrooms: 5,
    amenities: ['wifi', 'kitchen', 'pool', 'free_parking', 'tv', 'washer'],
    description:
      'Villa 6 phòng ngủ ngay sát bãi biển, hồ bơi vô cực nhìn ra biển, bếp đầy đủ tiện nghi. Lý tưởng cho tiệc cưới nhỏ hoặc nghỉ dưỡng nhóm lớn.',
    host: { name: 'Chị Hương', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60',
  },
];

export function getListingById(id) {
  if (!id) return null;
  const cleanId = String(id).trim();
  const listing = mockListings.find(
    (l) => l.id === cleanId || l.id === `mock-${cleanId}` || l.id.replace('mock-', '') === cleanId,
  );
  if (!listing) return null;
  return { ...listing, images: gallery(listing.image) };
}
