'use strict';

module.exports = class APIError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.message = message || 'General error';
    this.statusCode = statusCode || 400;
    this.code = code || 'general_error';
  }
};
