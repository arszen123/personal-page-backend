'use strict';

const APIError = require('../exceptions/api-exception');
const WidgetRepository = require('../repository/widget');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  createEducation,
  updateEducation,
  deleteEducation,
  getEducations,
};

async function createEducation(req, res) {
  const userId = req.auth.user_id;
  const education = _createEducationForDb(req.swagger.params.education.value || {});
  education.userId = ObjectId(userId);
  const result = await req.db.collection('education').insertOne(education);
  return res.json({
    success: true,
    id: result.insertedId
  });
}

async function updateEducation(req, res) {
  const userId = req.auth.user_id;
  const educationId = req.swagger.params.id.value;
  const education = _createEducationForDb(req.swagger.params.education.value || {});
  await req.db.collection('education').
      updateOne({_id: ObjectId(educationId), userId: ObjectId(userId)},
          {$set: education});
  return res.json({success:true});
}


async function deleteEducation(req, res) {
  const userId = req.auth.user_id;
  const educationId = req.swagger.params.id.value;
  await req.db.collection('education').
      deleteOne({_id: ObjectId(educationId), userId: ObjectId(userId)});
  await WidgetRepository.deleteWidget(req.db, userId, educationId, 'education');
  return res.json({success:true});
}

async function getEducations(req, res) {
  const userId = req.auth.user_id;
  let result = [];
  try {
    result = await req.db.collection('education').
        find({userId: ObjectId(userId)}, {projection: {userId: 0}}).toArray();
    for (let resultKey in result) {
      result[resultKey].id = result[resultKey]._id;
      delete result[resultKey]._id;
    }
  } catch (e) {
  }
  return res.json(result);
}

function _createEducationForDb(education) {
  education.from = new Date(education.from);
  education.to = new Date(education.to);
  return education;
}
