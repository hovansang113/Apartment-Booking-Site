const { PrismaClient, ListingStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const LISTINGS = [
  {
    title: 'Căn hộ view sông Hàn',
    description:
      'Căn hộ nằm ngay mặt sông Hàn, ban công riêng nhìn toàn cảnh cầu Rồng về đêm. Cách bãi biển Mỹ Khê 10 phút đi xe, gần khu ẩm thực và trung tâm thành phố.',
    category: 'apartment',
    address: 'Hải Châu, Đà Nẵng',
    defaultPrice: 850000,
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ['wifi', 'kitchen', 'air_conditioning', 'washer'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=60',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=60',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=60',
    ],
  },
  {
    title: 'Nhà nguyên căn gần biển Mỹ Khê',
    description:
      'Nhà nguyên căn 2 tầng cách bãi biển Mỹ Khê 3 phút đi bộ, sân trước rộng rãi, phù hợp cho nhóm bạn hoặc gia đình đông người. Đầy đủ tiện nghi, bếp nấu ăn rộng.',
    category: 'house',
    address: 'Mỹ Khê, Đà Nẵng',
    defaultPrice: 1450000,
    guestCapacity: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ['wifi', 'kitchen', 'free_parking', 'tv'],
    images: [
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=60',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=60',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=60',
    ],
  },
  {
    title: 'Biệt thự hồ bơi riêng Đà Lạt',
    description:
      'Biệt thự 3 phòng ngủ giữa rừng thông Đà Lạt, hồ bơi riêng, sân vườn rộng 500m². Không khí mát mẻ quanh năm, cách trung tâm Đà Lạt 5km, yên tĩnh và riêng tư.',
    category: 'villa',
    address: 'Đà Lạt, Lâm Đồng',
    defaultPrice: 3200000,
    guestCapacity: 8,
    bedrooms: 3,
    beds: 5,
    bathrooms: 3,
    amenities: ['wifi', 'kitchen', 'pool', 'free_parking', 'tv', 'workspace'],
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=60',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=60',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=60',
    ],
  },
];

async function main() {
  console.log('Seeding...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stayhub.vn' },
    update: {},
    create: {
      email: 'admin@stayhub.vn',
      passwordHash,
      fullName: 'Admin StayHub',
      role: 'admin',
    },
  });

  const host = await prisma.user.upsert({
    where: { email: 'host@stayhub.vn' },
    update: {},
    create: {
      email: 'host@stayhub.vn',
      passwordHash,
      fullName: 'Nguyễn Văn An',
      role: 'host',
    },
  });

  for (const data of LISTINGS) {
    const existing = await prisma.listing.findFirst({
      where: { hostId: host.id, title: data.title },
    });
    if (existing) {
      console.log(`  skip: ${data.title}`);
      continue;
    }

    await prisma.listing.create({
      data: {
        hostId: host.id,
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.address,
        defaultPrice: data.defaultPrice,
        guestCapacity: data.guestCapacity,
        bedrooms: data.bedrooms,
        beds: data.beds,
        bathrooms: data.bathrooms,
        status: ListingStatus.approved,
        images: {
          create: data.images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
        },
        amenities: {
          create: data.amenities.map((amenity) => ({ amenity })),
        },
      },
    });
    console.log(`  created: ${data.title}`);
  }

  console.log(`Done. Admin: admin@stayhub.vn / Host: host@stayhub.vn (Password123!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
