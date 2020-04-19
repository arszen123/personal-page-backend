'use strict';

const APIError = require('../exceptions/api-exception');
const WidgetRepository = require('../repository/widget');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  createContact,
  updateContact,
  deleteContact,
  getContacts,
};

async function createContact(req, res) {
  let userId = req.auth.user_id;
  let contact = req.swagger.params.contact.value || {};
  contact.userId = ObjectId(userId);
  if (contact.type !== 'other') {
    delete contact.other_type;
  }
  let result = await req.db.collection('contact').insertOne(contact);
  return res.json({
    success: true,
    id: result.insertedId
  });
}

async function updateContact(req, res) {
  let userId = req.auth.user_id;
  let contactId = req.swagger.params.id.value;
  let contact = req.swagger.params.contact.value || {};
  await req.db.collection('contact').
      updateOne({_id: ObjectId(contactId), userId: ObjectId(userId)},
          {$set: contact});
  return res.json({success:true});
}


async function deleteContact(req, res) {
  let userId = req.auth.user_id;
  let contactId = req.swagger.params.id.value;
  await req.db.collection('contact').
      deleteOne({_id: ObjectId(contactId), userId: ObjectId(userId)});
  await WidgetRepository.deleteWidget(req.db, userId, contactId, 'education');
  return res.json({success:true});
}

async function getContacts(req, res) {
  let userId = req.auth.user_id;
  let result = [];
  try {
    result = await req.db.collection('contact').
        find({userId: ObjectId(userId)}, {projection: {userId: 0}}).toArray();
    for (let resultKey in result) {
      result[resultKey].id = result[resultKey]._id;
      delete result[resultKey]._id;
    }
  } catch (e) {
  }
  return res.json(result);
}
