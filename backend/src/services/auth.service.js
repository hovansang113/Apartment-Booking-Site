const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { UserRole, UserStatus } = require('@prisma/client');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt.util');
const AppError = require('../utils/appError');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

async function googleLogin({ credential }) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  }).catch(() => { throw new AppError(401, 'Invalid Google token'); });

  const { email, name, picture } = ticket.getPayload();

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.status === UserStatus.locked) throw new AppError(403, 'This account has been locked');
    // Update avatar if not set
    if (!user.avatarUrl && picture) {
      user = await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: picture } });
    }
  } else {
    // Auto-create as host
    user = await prisma.user.create({
      data: {
        email,
        fullName: name,
        avatarUrl: picture,
        role: UserRole.host,
        isGuest: false,
      },
    });
  }

  return issueSession(user);
}

module.exports = { register, login, googleLogin, sanitizeUser };
