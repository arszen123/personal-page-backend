'use strict';

const APIError = require('../exceptions/api-exception');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');

module.exports = {
  getPage,
  updatePage,
  getPageForPublic,
  isExists,
};

/**
 * Get Page data for logged in user
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function getPage(req, res) {
  let page = await req.db.collection('page').findOne({
    userId: ObjectId(req.auth.user_id),
  }, {_id: 0});
  return res.json(page);
}

/**
 * Update Page settings for logged user.
 * @param req
 * @param res
 * @returns {Promise<*|void|Promise<any>>}
 */
async function updatePage(req, res) {
  let page = req.swagger.params.page.value || {};
  let userIdObj = ObjectId(req.auth.user_id);
  page.userId = userIdObj;
  try {
    await req.db.collection('page').
        update({userId: userIdObj}, page, {upsert: true});
  } catch (e) {
    return res.json({
      success: false,
    });
  }
  return res.json({
    success: true,
  });
}

/**
 * Get User page data
 * @param req
 * @param res
 * @return {Promise<void>}
 */
async function getPageForPublic(req, res) {
  if (!req.page) {
    res.throw(new APIError('Not found!', 404));
  }
  const pageRes = [];
  const pageElements = req.page.page;
  const userId = req.page.userId;
  const userIdObjId = ObjectId(userId);
  for (let pageKey in pageElements) {
    const element = pageElements[pageKey];
    const elementType = element['type'];
    const data = {
      type: elementType,
      gs: element.gs,
    };

    // check if element type is valid
    if (!['skill', 'education', 'contact', 'experience', 'language'].includes(elementType)) {
      continue;
    }

    if (elementType === 'skill') {
      data.data = req.db.collection(elementType).findOne({
        userId: userIdObjId,
      }, {projection: {userId: 0, _id: 0, id: 0}});
    } else {
      data.data = req.db.collection(elementType).findOne({
        _id: ObjectId(element['element']),
        userId: userIdObjId,
      }, {projection: {userId: 0, _id: 0, id: 0}});
    }

    pageRes.push(data);
  }

  for (let pageRe of pageRes) {
    pageRe.data = await pageRe.data;
    if (pageRe.type === 'skill') {
      pageRe.data = pageRe.data.skills;
    }
  }
  const user = (await req.db.collection('user').findOne({
    _id: userIdObjId,
  }, {projection: {_id: 0, details: 1}})).details;

  const basePath = './data/profile_picture';
  try {
    if (fs.existsSync(`${basePath}/${userId}.png`)) {
      user.profile_picture = `http://127.0.0.1:8080/profile_picture/${userId}.png`;
    }
  } catch (e) {}
  return res.json({
    success: true,
    user: user,
    page: pageRes,
  });
}

/**
 * Does the page id exists
 *
 * @param req
 * @param res
 * @return {Promise<*|void|Promise<any>>}
 */
async function isExists(req, res) {
  let userId = req.auth.user_id;
  let id = req.swagger.params.id.value || null;
  let isExists = false;
  try {
    let page = await req.db.collection('page').findOne({
      'security.page_id': id,
    });
    if (page !== null) {
      isExists = !page.userId.equals(userId);
    }
  } catch (e) {
  }
  return res.json({
    exists: isExists,
  });
}
