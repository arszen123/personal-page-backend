'use strict';

const APIError = require('../exceptions/api-exception');
const ObjectId = require('mongodb').ObjectId;
const PasswordHelper = require('../helpers/password-helper');
const AuthService = require('../services/auth-service');
const ObjectParser = require('../utils/object-parser');
const fs = require('fs');

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
    user = ObjectParser.reduce(user, {
      0: 'email',
      1: 'password',
      2: 'registration_date',
      'details': {
        0: 'first_name',
        1: 'last_name',
      },
    });
    let result = await req.db.collection('user').insertOne(user);
    userId = result.insertedId;
  } catch (e) {
    return res.throw(new APIError('User already exists'));
  }

  return res.json(AuthService.createTokenResponse(userId));
}

/**
 * Get the user by id
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function getUser(req, res) {
  let user = await req.db.collection('user').
      findOne({_id: ObjectId(req.auth.user_id)},
          {
            projection: {
              email: 1,
              'details.first_name': 1,
              'details.last_name': 1,
            },
          });
  user.first_name = user.details.first_name;
  user.last_name = user.details.last_name;
  user = ObjectParser.reduce(user, [
    'email',
    'first_name',
    'last_name',
  ]);
  return res.json(user);
}

/**
 * Update user
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function updateUserDetails(req, res) {
  const userId = req.auth.user_id;
  let userData = req.swagger.params.user.value || {};
  try {
    await req.db.collection('user').
        updateOne({_id: ObjectId(userId)}, {
          $set: {
            email: userData.email,
            details: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              birth_date: userData.birth_date,
              birth_place: userData.birth_place,
              living_place: userData.living_place,
              bio: userData.bio,
            },
          },
        });
    if (userData.profile_picture) {
      const basePath = './data/profile_picture';
      if (userData.profile_picture === 'delete') {
        await fs.unlink(
            `${basePath}/${userId}.png`,
            (err, data) => {
              console.log(err);
            },
        );
      } else {
        const imgData = userData.profile_picture.replace('data:image/png;base64,', '');
        await fs.writeFile(
            `${basePath}/${userId}.png`,
            imgData,
            'base64',
            (err, data) => {
              console.log(err);
            },
        );
      }
    }
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
  const userId = req.auth.user_id;
  let userData = await req.db.collection('user').
      findOne({_id: ObjectId(userId)}, {
        projection: {
          _id: 0,
          email: 1,
          details: 1,
        },
      });
  const result = {
    first_name: userData.details.first_name,
    last_name: userData.details.last_name,
    email: userData.email,
    birth_date: userData.details.birth_date,
    birth_place: userData.details.birth_place,
    living_place: userData.details.living_place,
    bio: userData.details.bio,
  };
  const basePath = './data/profile_picture';
  try {
    if (fs.existsSync(`${basePath}/${userId}.png`)) {
      result.profile_picture = `http://127.0.0.1:8080/profile_picture/${userId}.png`;
    }
  } catch (e) {}
  return res.json(result);
}
