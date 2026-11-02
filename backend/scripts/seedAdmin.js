const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@reservesmith.com';
  const password = 'Admin@123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin account already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Admin',
      role: 'admin',
      status: 'active',
    },
  });

  console.log('Admin account created!');
  console.log('Email   :', email);
  console.log('Password:', password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
