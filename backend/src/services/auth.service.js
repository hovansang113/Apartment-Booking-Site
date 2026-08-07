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

// REQ_01: register a host account (regular users don't self-register — see REQ_14 guest login)
async function register({ email, password, fullName, phone }) {
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
      role: UserRole.host,
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

// REQ_14: guest quick login - book without registering first
async function guestLogin({ email, fullName, phone }) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.isGuest) {
    throw new AppError(409, 'This email already has an account, please log in instead');
  }

  if (user) {
    if (user.status === UserStatus.locked) {
      throw new AppError(403, 'This account has been locked');
    }
    user = await prisma.user.update({
      where: { id: user.id },
      data: { fullName, phone },
    });
  } else {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);
    user = await prisma.user.create({
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

  return issueSession(user);
}

module.exports = { register, login, guestLogin, sanitizeUser };
