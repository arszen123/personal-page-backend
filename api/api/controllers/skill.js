'use strict';

const APIError = require('../exceptions/api-exception');
const UserRepository = require('../repository/user');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  createSkills,
  getSkills,
};

async function createSkills(req, res) {
  let userId = req.auth.user_id;
  let skillsParam = req.swagger.params.skill.value.skill || [];
  let skills = {
    userId: ObjectId(userId),
    skills: skillsParam,
  };
  console.log(skills);
  try {
    await req.db.collection('skill').update({userId: ObjectId(userId)}, skills, {upsert: true});
  } catch (e) {
    res.throw(e);
  }
  return res.json({success: true});
}

async function getSkills(req, res) {
  let userId = req.auth.user_id;
  let result = {skills: []};
  try {
    result = await req.db.collection('skill').
        findOne({userId: ObjectId(userId)});
  } catch (e) {
    res.throw(e);
  }
  return res.json((result || {skills:[]}).skills);
}
