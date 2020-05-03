'use strict';

const APIError = require('../exceptions/api-exception');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const pdf = require('html-pdf');
const path = require("path");
const CvBuilderService = require('../services/cv-builder-service');

module.exports = {
  getPage,
  updatePage,
  getPageForPublic,
  downloadCv,
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
  const page = await _getPageResponse(req.db, req.page.page, req.page.userId);
  return res.json({
    success: true,
    user: page.user,
    page: page.pageRes,
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

async function downloadCv(req, res) {
  if (!req.page) {
    res.throw(new APIError('Not found!', 404));
  }
  const userId = req.page.userId;
  const page = await _getPageResponse(req.db, req.page.page, userId);
  const user = page.user;
  const cvBuilder = new CvBuilderService(user, userId, page.pageRes);

  const filename = (user.first_name + '_' + user.last_name).replace(/[\W]+/g,"").toLowerCase();
  cvBuilder.buildPDF().toStream((err, stream) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    stream.pipe(res);
    return;
  });
}

async function _getPageResponse(db, pageElements, userId) {
  const userIdObjId = ObjectId(userId);
  const pageRes = [];
  for (const pageKey in pageElements) {
    const element = pageElements[pageKey];
    const elementType = element['type'];
    const data = {
      type: elementType,
      gs: element.gs,
    };

    // check if element type is valid
    if (!['skill', 'education', 'contact', 'experience', 'language'].includes(
        elementType)) {
      continue;
    }

    if (elementType === 'skill') {
      data.data = db.collection(elementType).findOne({
        userId: userIdObjId,
      }, {projection: {userId: 0, _id: 0, id: 0}});
    } else {
      data.data = db.collection(elementType).findOne({
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
  const user = (await db.collection('user').findOne({
    _id: userIdObjId,
  }, {projection: {_id: 0, details: 1}})).details;

  const basePath = './data/profile_picture';
  try {
    if (fs.existsSync(`${basePath}/${userId}.png`)) {
      user.profile_picture = process.env.API_URL +
          `/profile_picture/${userId}.png`;
    }
  } catch (e) {}
  return {pageRes, user};
}
