const authService = require('../services/auth.service');
const { created, ok } = require('../utils/response.util');

// REQ_01 - register, login, issue JWT
async function register(req, res) {
  const { email, password, fullName, phone, role } = req.body;
  const result = await authService.register({ email, password, fullName, phone, role });
  return created(res, result, 'Registered successfully');
}

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return ok(res, result, 'Logged in successfully');
}

// REQ_14 - guest quick login
async function guestLogin(req, res) {
  const { email, fullName, phone } = req.body;
  const result = await authService.guestLogin({ email, fullName, phone });
  return ok(res, result, 'Guest authenticated successfully');
}

module.exports = { register, login, guestLogin };
