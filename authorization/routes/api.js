'use strict';
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const router = express.Router();

router.post('/validate-client', async function(req, res) {
  const data = req.body;
  const app = await req.db.collection('app').findOne({
    _id: ObjectId(data.client_id),
  });
  if (!app) {
    res.json({
      is_valid: false,
      error_code: 'app_not_exists',
    });
    return;
  }
  const isRedirectUriMath = app.callback_url === data.redirect_uri;
  if (!isRedirectUriMath) {
    res.json({
      is_valid: false,
      error_code: 'redirect_uri_not_allowed',
    });
    return;
  }
  if (data.response_type !== 'code') {
    res.json({
      is_valid: false,
      error_code: 'response_type_not_allowed',
    });
    return;
  }
  res.json({
    is_valid: true,
    app: {
      name: app.app_name,
      scopes: app.scopes,
    },
  });
});

router.get('/clients', async function(req, res) {
  const data = req.query;
  const clientIds = typeof data.client_ids === 'string'
      ? [data.client_ids]
      : data.client_ids;

  const resPromise = [];
  for (let clientIdsKey in clientIds) {
    if (!clientIds.hasOwnProperty(clientIdsKey)) continue;
    resPromise.push(req.db.collection('app').findOne({
      _id: ObjectId(clientIds[clientIdsKey]),
    }, {projection: {_id: 1, app_name: 1}}));
  }
  const result = [];
  for (let resPromiseElement of resPromise) {
    const app = (await resPromiseElement);
    result.push({
      id: app._id,
      name: app.app_name,
    });
  }
  res.json({
    clients: result,
  });
});

router.delete('/client/:clientId/user/:userId', async function(req, res) {
  const clientId = req.params.clientId;
  const userId = req.params.userId;
  const app = await req.db.collection('app').findOne({
    _id: ObjectId(clientId),
  });
  if (app.delete_callback_url) {
    //  @TODO send http request to the specified url
  }
  // We should wait the request to end to log the http status response,
  // but for now we return we wont.
  res.json({
    success: true,
  });
});

module.exports = function(getRenderBaseOptionsFn) {
  return router;
};
