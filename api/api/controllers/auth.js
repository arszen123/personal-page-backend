'use strict';

const APIError = require('../exceptions/api-exception');
const ObjectId = require('mongodb').ObjectId;
const UserRepository = require('../repository/user');
const PasswordHelper = require('../helpers/password-helper');
const JWTHelper = require('../helpers/jwt-helper');

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
  let token = JWTHelper.sign({user_id: user._id});
  return res.json({
    token: token,
  });
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

