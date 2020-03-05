'use strict';
const jwt = require('jsonwebtoken');

module.exports = class JWTHelper {
  static sign(data, options) {
    let token = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: Number.parseInt(process.env.JWT_EXPIRES_IN),
      ...(options || {})
    });
    return token;
  }

  static verify(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
    }
    return null;
  }
};
