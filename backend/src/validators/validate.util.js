const { validationResult } = require('express-validator');
const { fail } = require('../utils/response.util');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 422, errors.array()[0].msg);
  }
  next();
}

module.exports = { validate };
