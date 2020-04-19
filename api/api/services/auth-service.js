'use strict';

const JWTHelper = require('../helpers/jwt-helper');

module.exports = class AuthService {
  static createTokenResponse(userId) {
    const token = JWTHelper.get().sign({user_id: userId});
    const expiration = JWTHelper.get().options.expiresIn;
    const result = {token};
    if (expiration) {
      const expires_at = new Date();
      expires_at.setTime(expires_at.getTime() + expiration * 1000);
      result.expires_at = expires_at;
    }
    return result;
  }
};
