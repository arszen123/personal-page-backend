'use strict';

const APIError = require('../exceptions/api-exception');
const WidgetRepository = require('../repository/widget');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getLanguages,
};

async function createLanguage(req, res) {
  let userId = req.auth.user_id;
  let language = req.swagger.params.language.value || {};
  language.userId = ObjectId(userId);
  let result = await req.db.collection('language').insertOne(language);
  return res.json({
    success: true,
    id: result.insertedId,
  });
}

async function updateLanguage(req, res) {
  let userId = req.auth.user_id;
  let languageId = req.swagger.params.id.value;
  let language = req.swagger.params.language.value || {};
  await req.db.collection('language').
      updateOne({_id: ObjectId(languageId), userId: ObjectId(userId)},
          {$set: language});
  return res.json({success:true});
}


async function deleteLanguage(req, res) {
  const userId = req.auth.user_id;
  const languageId = req.swagger.params.id.value;
  await req.db.collection('language').
      deleteOne({_id: ObjectId(languageId), userId: ObjectId(userId)});
  await WidgetRepository.deleteWidget(req.db, userId, languageId, 'language');
  return res.json({success:true});
}

async function getLanguages(req, res) {
  let userId = req.auth.user_id;
  let result = [];
  try {
    result = await req.db.collection('language').
        find({userId: ObjectId(userId)}, {projection: {userId: 0}}).toArray();
    for (let resultKey in result) {
      result[resultKey].id = result[resultKey]._id;
      delete result[resultKey]._id;
    }
  } catch (e) {
  }
  return res.json(result);
}
