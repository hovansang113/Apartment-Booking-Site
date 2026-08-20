const COOKIE_NAME = 'token';

// 24h - khop voi JWT_EXPIRES_IN mac dinh trong jwt.util.js. Doi ca 2 cung
// luc neu sau nay doi thoi han token.
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE_MS,
};

module.exports = { COOKIE_NAME, cookieOptions };
