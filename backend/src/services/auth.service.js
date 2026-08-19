const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { UserRole, UserStatus } = require('@prisma/client');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt.util');
const AppError = require('../utils/appError');

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function issueSession(user) {
  const token = signToken({ id: user.id, role: user.role, isGuest: user.isGuest });
  return { user: sanitizeUser(user), token };
}

// REQ_01: register a user/host account
async function register({ email, password, fullName, phone, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Email is already in use');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      role: role || UserRole.user,
      isGuest: false,
    },
  });

  return issueSession(user);
}

// REQ_01: login for user/host/admin
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AppError(401, 'Invalid email or password');
  }
  if (user.status === UserStatus.locked) {
    throw new AppError(403, 'This account has been locked');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new AppError(401, 'Invalid email or password');
  }

  return issueSession(user);
}

// REQ_14 (dung chung voi luong dat phong khong can tai khoan) - tim user
// isGuest theo email, tao moi neu chua co; tu choi neu email da thuoc ve 1
// tai khoan that (chan chiem tai khoan). Nhan `db` (PrismaClient hoac tx cua
// 1 transaction dang chay) de goi duoc atomically tu booking.service.js,
// cung pattern voi pricing.service.js.
async function findOrCreateGuestUser(db, { email, fullName, phone }) {
  let user = await db.user.findUnique({ where: { email } });
  if (user && !user.isGuest) {
    throw new AppError(409, 'This email already has an account, please log in instead');
  }

  if (user) {
    if (user.status === UserStatus.locked) {
      throw new AppError(403, 'This account has been locked');
    }
    user = await db.user.update({
      where: { id: user.id },
      data: { fullName, phone },
    });
  } else {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);
    user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: UserRole.user,
        isGuest: true,
      },
    });
  }

  return user;
}

// REQ_14: guest quick login - book without registering first
async function guestLogin({ email, fullName, phone }) {
  const user = await findOrCreateGuestUser(prisma, { email, fullName, phone });
  return issueSession(user);
}

// Dung cho GET /api/auth/me - lay lai thong tin user hien tai theo id trong
// token, khong doc thang tu payload token vi role/status co the da doi (vd
// admin vua khoa tai khoan) sau khi token duoc cap.
async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return sanitizeUser(user);
}

// Host "Settings" - nop thong tin thue/giay to. Mo phong theo cach Airbnb thu
// thap thong tin nay (Form W-9: ten phap ly, dia chi, tax ID, tax
// classification) - KHONG phai tu van phap ly/thue Viet Nam chinh thuc, chi
// la UI mo phong cho du an hoc tap. Chuyen sang "pending" moi lan nop de cho
// admin duyet (REQ_03 - hien chua co UI duyet that, giu lai trang thai nay de
// dung sau).
async function updateTaxInfo(userId, { legalName, taxId, taxpayerType, idNumber }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      legalName,
      taxId,
      taxpayerType,
      idNumber: idNumber || null,
      verificationStatus: 'pending',
    },
  });
  return sanitizeUser(user);
}

// Host "Payout information" - tai khoan ngan hang UK de platform tra tien
// host sau khi tru hoa hong (thanh toan qua Braintree vao tai khoan platform,
// chua co he thong tra tien tu dong cho host - xem TODO.md). Sort code +
// account number la chuan UK, khong can chuan hoa/bo dau ten chu tai khoan
// nhu he thong VN truoc day (UK Faster Payments/BACS khong bat buoc ten
// KHONG DAU nhu Napas).
async function updateBankInfo(userId, { bankSortCode, bankAccountNumber, bankAccountHolder }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      bankSortCode,
      bankAccountNumber,
      bankAccountHolder: bankAccountHolder.trim(),
    },
  });
  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  guestLogin,
  findOrCreateGuestUser,
  getMe,
  updateTaxInfo,
  updateBankInfo,
  sanitizeUser,
};
