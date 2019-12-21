'use strict';

const APIError = require('../exceptions/api-exception');
const ObjectId = require('mongodb').ObjectId;
const UserRepository = require('../repository/user');

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
    password: auth.password,
  }, {_id: 1});
  if (!user) {
    return res.throw(new APIError('Wrong username or password', 401,
        'auth_wrong_credentials'));
  }
  return res.json({
    token: await UserRepository.getAuthToken(req.db, user._id),
  });
}

/**
 * Logout the user
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function logout(req, res) {
  let auth = req.swagger.params.token.value || {};
  let token = auth.token;
  await req.db.collection('token').removeOne({_id: ObjectId(token)});
  return res.json({
    success: true,
  });
}

