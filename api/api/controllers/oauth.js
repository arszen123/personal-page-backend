'use strict';

const ApiError = require('../exceptions/api-exception');
const oAuthService = require('../services/oauth-service');
const JWTHelper = require('../helpers/jwt-helper');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  checkUnauthorizedValidity,
  checkAuthorizedValidity,
  authorize,
  logout,
  deleteApp,
  listApps,
};

async function checkUnauthorizedValidity(req, res) {
  checkValidity(req, res);
}

async function checkAuthorizedValidity(req, res) {
  checkValidity(req, res);
}

async function checkValidity(req, res) {
  const data = req.swagger.params.data.value || {};
  const userId = (req.auth || {}).user_id;
  oAuthService.checkValidity(data, async (result) => {
    const scopes = result.app.scopes;
    const clientId = data.client_id;
    result.app.scopes = getScopesWithDescription(result.app.scopes, req.swagger);
    let token = null;
    if (typeof userId !== 'undefined') {
      token = await getOauthUserToken(
          req.db,
          false,
          {userId, clientId, scopes},
      );
    }

    if (token !== null) {
      result.token = token;
    }

    res.json(result);
  }, error => {
    res.json(error.result);
  });
}

async function authorize(req, res) {
  const data = req.swagger.params.data.value || {};
  const userId = req.auth.user_id;
  oAuthService.checkValidity(data, async (result) => {
    const scopes = result.app.scopes;
    const clientId = data.client_id;
    const token = await getOauthUserToken(req.db, true,
        {userId, clientId, scopes});
    res.json({
      token,
    });
  }, error => {
    res.throw(new ApiError('Internal error', 400, 'internal_error'));
  });
}

async function logout(req, res) {
  const token = req.oauth.token;
  try {
    await req.db.collection('oauth_user_token').deleteOne({
      token,
    });
  } catch (e) {
    res.throw(new ApiError('Error'));
    return;
  }
  res.json({
    success: true,
  });
}

/**
 * Returns an oauth user token for the client
 *
 * @param db DB instance
 * @param withAuthorization Authorize the client or only try to get a token
 * @param userId
 * @param clientId
 * @param scopes
 * @return {Promise<null|undefined|*|number|PromiseLike<ArrayBuffer>>}
 */
async function getOauthUserToken(
    db,
    withAuthorization,
    {userId, clientId, scopes},
) {
  const oauthClientAccessData = {
    userId, clientId, scopes,
  };
  const oauthClientAccess = await db.collection('oauth_client_access').
      findOne({clientId, userId});
  console.table({clientId, userId});
  let oauthClientAccessId = null;
  const hasNoOauthClientAccess = typeof oauthClientAccess === 'undefined' || oauthClientAccess === null;

  if (hasNoOauthClientAccess && withAuthorization) {
    const inserted = await db.collection('oauth_client_access').
        insertOne(oauthClientAccessData);
    oauthClientAccessId = inserted.insertedId;
  } else if (hasNoOauthClientAccess && !withAuthorization) {
    return null;
  } else {
    oauthClientAccessId = oauthClientAccess._id;
  }

  const oauthUserToken = await db.collection('oauth_user_token').findOne({
    oauthClientAccessId: oauthClientAccessId,
  });

  if (typeof oauthUserToken === 'undefined' || oauthUserToken === null) {
    const token = JWTHelper.get('oauth').sign(oauthClientAccessData);
    await db.collection('oauth_user_token').insertOne({
      oauthClientAccessId: oauthClientAccessId,
      token: token,
    });
    return token;
  }
  return oauthUserToken.token;
}

async function deleteApp(req, res) {
  const oauthClientAccessId = req.swagger.params.id.value || '';
  const userId = req.auth.user_id;
  const oauthClientAccessIdObjectId = ObjectId(oauthClientAccessId);
  const result = await req.db.collection('oauth_client_access').
      findOneAndDelete({
        _id: oauthClientAccessIdObjectId,
        userId: userId,
      });
  const oauthClientAccess = result.value;
  oAuthService.revokeClientPermission({
    clientId: oauthClientAccess.clientId,
    userId: userId
  }, value => {
    res.json({
      success: value.success
    });
  }, err => {
    res.json({
      success: false
    });
  })
}

async function listApps(req, res) {
  const userId = req.auth.user_id;
  const apps = await (await req.db.collection('oauth_client_access').find({userId})).toArray();
  const appIds = [];
  for (let appsKey in apps) {
    if (!apps.hasOwnProperty(appsKey)) continue;
    appIds.push(apps[appsKey].clientId);
  }
  const newApps = [];
  for (let idx in apps) {
    newApps[apps[idx].clientId] = apps[idx];
  }
  oAuthService.getAppsName(appIds, (value) => {
    const result = [];
    for (let idx in value.clients) {
      if (!value.clients.hasOwnProperty(idx)) continue;
      const client = value.clients[idx];
      result.push({
        id: newApps[client.id]._id,
        name: client.name,
        scopes: getScopesWithDescription(newApps[client.id].scopes, req.swagger),
      });
    }
    res.json({
      apps: result
    })
  }, (err) => {
    res.throw(new ApiError('Internal server error', 500, 'internal_error'))
  })
}


function getScopesWithDescription(scopes, swagger) {
  const scopesDescription = swagger.swaggerObject.securityDefinitions.OAuth2.scopes;
  const res = [];
  for (const idx in scopes) {
    if (!scopes.hasOwnProperty(idx)) continue;
    const scopeName = scopes[idx];
    res.push({
      name: scopeName,
      description: scopesDescription[scopeName],
    });
  }
  return res;
}
