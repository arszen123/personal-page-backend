const JWTHelper = require('../api/helpers/jwt-helper');

module.exports = {
  init: function() {
    JWTHelper.register('default', {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    JWTHelper.register('oauth', {
      secret: process.env.JWT_OAUTH_SECRET,
    });
  },
};
