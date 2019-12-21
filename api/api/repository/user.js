'use strict';

const APIError = require('../exceptions/api-exception');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  getAuthToken,
};

async function getAuthToken(db, userId) {
  let token = await db.collection('token').insertOne({
    'user_id': userId,
    'valid_to': '2050-01-01',
  });
  return token.insertedId;
}
