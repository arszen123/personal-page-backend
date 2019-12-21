'use strict';

const APIError = require('../exceptions/api-exception');
const UserRepository = require('../repository/user');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getWorkExperiences,
};

async function createWorkExperience(req, res) {
  let userId = req.auth.user_id;
  let experience = req.swagger.params.experience.value || {};
  experience.userId = ObjectId(userId);
  req.db.collection('experience').insertOne(experience);
  return res.json({success: true});
}

async function updateWorkExperience(req, res) {
  let userId = req.auth.user_id;
  let experienceId = req.swagger.params.id.value;
  let experience = req.swagger.params.experience.value || {};
  await req.db.collection('experience').
      updateOne({_id: ObjectId(experienceId), userId: ObjectId(userId)},
          {$set: experience});
  return res.json({success:true});
}

async function deleteWorkExperience(req, res) {
  let userId = req.auth.user_id;
  let experienceId = req.swagger.params.id.value;
  await req.db.collection('experience').
      deleteOne({_id: ObjectId(experienceId), userId: ObjectId(userId)});
  return res.json({success:true});
}

async function getWorkExperiences(req, res) {
  let userId = req.auth.user_id;
  let result = [];
  try {
    result = await req.db.collection('experience').
        find({userId: ObjectId(userId)}, {projection: {userId: 0}}).toArray();
    for (let resultKey in result) {
      result[resultKey].id = result[resultKey]._id;
      delete result[resultKey]._id;
    }
  } catch (e) {
  }
  return res.json(result);
}
