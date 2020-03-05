'use strict';

const APIError = require('../exceptions/api-exception');
const UserRepository = require('../repository/user');
const ObjectId = require('mongodb').ObjectId;
const PasswordHelper = require('../helpers/password-helper');
const JWTHelper = require('../helpers/jwt-helper');

module.exports = {
  createUser,
  getUser,
  updateUserDetails,
  getUserDetails,
};

/**
 * Create New User
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function createUser(req, res) {
  let user = req.swagger.params.user.value || {};
  let userId = null;

  try {
    user.registration_date = new Date();
    user.password = PasswordHelper.hash(user.password);
    user.details = {
      first_name: user.first_name,
      last_name: user.last_name,
    };
    let result = await req.db.collection('user').insertOne(user);
    userId = result.insertedId;
  } catch (e) {
    return res.throw(new APIError('User already exists'));
  }

  return res.json({
    token: JWTHelper.sign({user_id: userId}),
  });
}

/**
 * Get the user by id
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function getUser(req, res) {
  const user = await req.db.collection('user').
      findOne({_id: ObjectId(req.auth.user_id)},
          {projection: {_id: false, password: false, details: false}});
  return res.json(user);
}

/**
 * Update user
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function updateUserDetails(req, res) {
  let userData = req.swagger.params.user.value || {};
  try {
    await req.db.collection('user').
        updateOne({_id: ObjectId(req.auth.user_id)}, {
          $set: {
            email: userData.email,
            details: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              birth_date: userData.birth_date,
              birth_place: userData.birth_place,
              living_place: userData.living_place,
            },
          },
        });
  } catch (e) {}
  return res.json({
    success: true,
  });
}

/**
 * Return user details
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function getUserDetails(req, res) {
  let userData = await req.db.collection('user').
      findOne({_id: ObjectId(req.auth.user_id)}, {
        projection: {
          _id: 0,
          email: 1,
          'details.first_name': 1,
          'details.last_name': 1,
          'details.birth_date': 1,
          'details.birth_place': 1,
          'details.living_place': 1,
        },
      });
  return res.json({
    first_name: userData.details.first_name,
    last_name: userData.details.last_name,
    email: userData.email,
    birth_date: userData.details.birth_date,
    birth_place: userData.details.birth_place,
    living_place: userData.details.living_place,
  });
}
