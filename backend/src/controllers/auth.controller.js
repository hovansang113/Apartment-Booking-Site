const authService = require('../services/auth.service');
const { created, ok } = require('../utils/response.util');

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

async function googleLogin(req, res) {
  const { credential } = req.body;
  const result = await authService.googleLogin({ credential });
  return ok(res, result, 'Logged in with Google');
}

module.exports = { register, login, googleLogin };
