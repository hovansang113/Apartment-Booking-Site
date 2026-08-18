// REQ_05/06 da noi API that (xem listingService.js) - file nay gio chi con 2
// vai tro: (1) fallback hien thi cho Home.jsx khi API loi that (khong phai
// khi API tra ve rong), (2) du lieu ten dia diem mau cho LocationDropdown.js.
// Noi dung UK (18/8, thay ban VN cu) - khop yeu cau Jason "listings we need
// to show are for the UK only", tranh hien dia danh Viet Nam khi API loi.

export const mockListings = [
  {
    id: 'mock-1',
    title: 'Riverside apartment with city views',
    address: 'South Bank, London',
    category: 'apartment',
    pricePerNight: 145,
    rating: 4.92,
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'air_conditioning', 'washer'],
    description:
      'A bright riverside flat with a private balcony looking out over the Thames. Ten minutes on foot to the Southbank Centre, close to restaurants and the Tube.',
    host: { name: 'James', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-2',
    title: 'Whole house near the seafront',
    address: 'Brighton, East Sussex',
    category: 'house',
    pricePerNight: 210,
    rating: 4.85,
    guestCapacity: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ['wifi', 'kitchen', 'free_parking', 'tv'],
    description:
      'A two-storey house three minutes\' walk from Brighton beach, with a generous front garden — ideal for groups of friends or larger families.',
    host: { name: 'Sophie', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-3',
    title: 'Country villa with private pool',
    address: 'Cotswolds, Gloucestershire',
    category: 'villa',
    pricePerNight: 460,
    rating: 4.98,
    guestCapacity: 10,
    bedrooms: 5,
    beds: 6,
    bathrooms: 4,
    amenities: ['wifi', 'kitchen', 'pool', 'free_parking', 'tv', 'workspace'],
    description:
      'A modern villa set among rolling countryside, with a heated private pool and a garden built for barbecues. Ideal for a company retreat or a family gathering.',
    host: { name: 'Oliver', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-4',
    title: 'Minimalist studio in the old town',
    address: 'Edinburgh, Scotland',
    category: 'homestay',
    pricePerNight: 88,
    rating: 4.9,
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['wifi', 'air_conditioning', 'workspace'],
    description:
      'A calm, minimalist studio just off the Royal Mile, a five-minute walk from the castle. Quiet and well suited to couples or solo travellers.',
    host: { name: 'Isla', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-5',
    title: 'Central hotel room',
    address: 'City Centre, Manchester',
    category: 'hotel_room',
    pricePerNight: 95,
    rating: 4.7,
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['wifi', 'air_conditioning', 'tv'],
    description:
      'A hotel room right in the city centre, walking distance to the main shopping streets and transport links. Daily housekeeping, 24-hour reception.',
    host: { name: 'The Riverside Hotel', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-6',
    title: 'Modern studio flat',
    address: 'Camden, London',
    category: 'apartment',
    pricePerNight: 78,
    rating: 4.8,
    guestCapacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'washer', 'workspace'],
    description:
      'A compact, fully furnished studio close to Regent\'s Canal and Camden Market. Well suited to a short business trip.',
    host: { name: 'Daniel', isSuperhost: false },
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-7',
    title: 'Cosy cabin in the woods',
    address: 'Lake District, Cumbria',
    category: 'house',
    pricePerNight: 120,
    rating: 4.95,
    guestCapacity: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'free_parking'],
    description:
      'A warm timber cabin among the pines with valley views. Wood-burning stove included — perfect for a winter break.',
    host: { name: 'Harry', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'mock-8',
    title: 'Villa steps from the beach',
    address: 'St Ives, Cornwall',
    category: 'villa',
    pricePerNight: 520,
    rating: 5,
    guestCapacity: 12,
    bedrooms: 6,
    beds: 7,
    bathrooms: 5,
    amenities: ['wifi', 'kitchen', 'pool', 'free_parking', 'tv', 'washer'],
    description:
      'A six-bedroom villa right by the beach, with an infinity pool overlooking the sea and a fully equipped kitchen. Ideal for a small wedding party or a large group getaway.',
    host: { name: 'Charlotte', isSuperhost: true },
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60',
  },
];
