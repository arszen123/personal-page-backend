'use strict';
const crypto = require('crypto');

module.exports = class PasswordHelper {
  static hash(password) {
    return crypto.pbkdf2Sync(
        password,
        process.env.PASSWORD_SALT,
        Number.parseInt(process.env.PASSWORD_ITERATIONS),
        Number.parseInt(process.env.PASSWORD_KEYLEN),
        process.env.PASSWORD_DIGEST
    ).toString('hex');
  }
};
