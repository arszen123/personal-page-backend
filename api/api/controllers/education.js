'use strict';

const APIError = require('../exceptions/api-exception');
const UserRepository = require('../repository/user');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  createEducation,
  updateEducation,
  deleteEducation,
  getEducations,
};

async function createEducation(req, res) {
  let userId = req.auth.user_id;
  let education = req.swagger.params.education.value || {};
  education.userId = ObjectId(userId);
  req.db.collection('education').insertOne(education);
  return res.json({success: true});
}

async function updateEducation(req, res) {
  let userId = req.auth.user_id;
  let educationId = req.swagger.params.id.value;
  let education = req.swagger.params.education.value || {};
  await req.db.collection('education').
      updateOne({_id: ObjectId(educationId), userId: ObjectId(userId)},
          {$set: education});
  return res.json({success:true});
}


async function deleteEducation(req, res) {
  let userId = req.auth.user_id;
  let educationId = req.swagger.params.id.value;
  await req.db.collection('education').
      deleteOne({_id: ObjectId(educationId), userId: ObjectId(userId)});
  return res.json({success:true});
}

async function getEducations(req, res) {
  let userId = req.auth.user_id;
  let result = [];
  try {
    result = await req.db.collection('education').
        find({userId: ObjectId(userId)}, {projection: {userId: 0}}).toArray();
    for (let resultKey in result) {
      result[resultKey].id = result[resultKey]._id;
      delete result[resultKey]._id;
    }
  } catch (e) {
    console.log(e);
  }
  console.log(result);
  return res.json(result);
}
