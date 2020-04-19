'use strict';
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const router = express.Router();
let getRenderBaseOptions = null;

router.get('/create', function(req, res) {
  res.render('app/create', getRenderBaseOptions(req));
});

router.post('/create', async function(req, res) {
  const data = req.body;
  data.userId = ObjectId(req.session.user.id);
  data.scopes = ['read']; //Third parties only has read access.
  try {
    let inserted = await req.db.collection('app').insertOne(data);
  } catch (e) {
    res.render('app/create', {
      ...getRenderBaseOptions(req),
      errorMessage: 'Something went wrong. Please try again later.',
    });
  }
  res.redirect('/app/list');
});

router.get('/list', async function(req, res) {
  let apps = await req.db.collection('app').find({
    userId: ObjectId(req.session.user.id),
  }).toArray();
  res.render('app/list', {
    ...getRenderBaseOptions(req),
    apps,
  });
});

router.get('/edit/:id', async function(req, res) {
  const appId = req.param('id');
  let app = null;
  if (typeof req.session.app !== 'undefined') {
    app = req.session.app[appId] || null;
  }

  if (app === null) {
    app = await req.db.collection('app').findOne({
      userId: ObjectId(req.session.user.id),
      _id: ObjectId(appId),
    });
    if (typeof req.session.app === 'undefined') {
      req.session.app = [];
    }
    req.session.app[appId] = app;
  }

  if (!app) {
    res.redirect('/app/list');
    return;
  }

  res.render('app/create', {
    ...getRenderBaseOptions(req),
    isEdit: true,
    app: app,
  });
});

router.post('/edit/:id', async function(req, res) {
  const data = req.body;
  const appId = req.param('id');
  data.userId = ObjectId(req.session.user.id);
  data.scopes = ['read']; //Third parties only has read access.
  try {
    let updated = await req.db.collection('app').updateOne({
      userId: ObjectId(req.session.user.id),
      _id: ObjectId(appId),
    }, {$set: data});
    req.session.app = [];
  } catch (e) {
    res.render('app/create', {
      ...getRenderBaseOptions(req),
      app: data,
      isEdit: true,
      errorMessage: 'Something went wrong. Please try again later.',
    });
    return;
  }
  res.redirect('/app/list');
});

router.get('/view/:id', async function(req, res) {
  const appId = req.param('id');
  let app = await req.db.collection('app').findOne({
    userId: ObjectId(req.session.user.id),
    _id: ObjectId(appId),
  });
  res.render('app/view', {
    ...getRenderBaseOptions(req),
    app,
    found: !!app,
  });
});

module.exports = function(getRenderBaseOptionsFn) {
  getRenderBaseOptions = getRenderBaseOptionsFn;
  return router;
};
