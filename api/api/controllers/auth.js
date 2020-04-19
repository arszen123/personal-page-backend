'use strict';

const APIError = require('../exceptions/api-exception');
const PasswordHelper = require('../helpers/password-helper');
const AuthService = require('../services/auth-service');

module.exports = {
  login,
  logout,
};

/**
 * Login the user
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function login(req, res) {
  let auth = req.swagger.params.auth.value || {};
  let user = await req.db.collection('user').findOne({
    email: auth.email,
    password: PasswordHelper.hash(auth.password),
  }, {_id: 1});
  if (!user) {
    return res.throw(new APIError('Wrong username or password', 401,
        'auth_wrong_credentials'));
  }

  return res.json(AuthService.createTokenResponse(user._id));
}

/**
 * Logout the user
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function logout(req, res) {
  return res.json({
    success: true,
  });
}

