'use strict';
const jwt = require('jsonwebtoken');
/**
 * It will hold the registered instances
 * @type {JWTHelper}
 */
const jwtHelpers = {};

class JWTHelper {

  constructor(opt) {
    this.options = opt;
  }

  static register(name, opt) {
    jwtHelpers[name] = new JWTHelper(opt);
  }

  static get(name) {
    name = name || 'default';
    return jwtHelpers[name];
  }

  sign(data, options) {
    let jwtOptions = {
      ...(options || {}),
    };
    if (this.options.expiresIn) {
      jwtOptions = {
        expiresIn: Number.parseInt(this.options.expiresIn),
        ...(options || {}),
      };
    }
    return jwt.sign(data, this.options.secret, jwtOptions);
  }

  verify(token) {
    try {
      return jwt.verify(token, this.options.secret);
    } catch (e) {
    }
    return null;
  }
};

module.exports = JWTHelper;
