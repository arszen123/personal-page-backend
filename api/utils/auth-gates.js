"use strict";
const JWTHelper = require('../api/helpers/jwt-helper');
const ApiError = require('../api/exceptions/api-exception');

class MissingTokenError extends ApiError {
  constructor(message, statusCode, code) {
    super(message);
    this.message = message || 'Missing authorization header';
    this.statusCode = statusCode || 401;
    this.code = code || 'missing_authorization_header';
  }
}

class ExpiredTokenError extends ApiError {
  constructor(message, statusCode, code) {
    super(message);
    this.message = message || 'Token is expired';
    this.statusCode = statusCode || 401;
    this.code = code || 'expired_token';
  }
}

module.exports = {
  /**
   * Oauth gate
   * @param req
   * @param authOrSecDef
   * @param scopesOrApiKey
   * @param callback
   * @return {Promise<*>}
   * @constructor
   */
  OAuth2: async function(req, authOrSecDef, scopesOrApiKey, callback) {
    const hasAuthHeader = !(
        !req.headers.authorization ||
        req.headers.authorization.indexOf('Bearer ') === -1
    );
    if (!hasAuthHeader) {
      return callback(new MissingTokenError())
    }
    const clientId = req.query.client_id;
    const token = req.headers.authorization.split(' ')[1];
    const data = JWTHelper.get('oauth').verify(token);
    if (data === null) {
      return callback(new ExpiredTokenError());
    }
    if (clientId !== data.clientId) {
      return callback(new ApiError('Wrong client_id', 401, 'wrong_client'));
    }
    const missingScopes = scopesOrApiKey.filter(elem => {
      return data.scopes.indexOf(elem) === -1;
    });
    if (missingScopes.length !== 0) {
      return callback(
          new ApiError('Missing scopes: ' + missingScopes.join(','), 401, 'missing_scopes')
      );
    }
    req.auth = {
      user_id: data.userId,
    };
    req.oauth = {
      token: token,
      data: data,
    };
    callback();
  },
  /**
   * Base application gate
   * @param req
   * @param authOrSecDef
   * @param tokenString
   * @param callback
   * @return {Promise<*>}
   * @constructor
   */
  Bearer: async function(req, authOrSecDef, tokenString, callback) {
    let hasAuthHeader = !(
        tokenString.indexOf('Bearer ') !== -1
    );
    // if (!hasAuthHeader) {
    //   return callback(new MissingTokenError());
    // }
    const token = tokenString.split(' ')[1];
    const data = JWTHelper.get().verify(token);
    if (data === null) {
      return callback(new ExpiredTokenError());
    }
    req.auth = {
      user_id: data.user_id,
    };
    callback();
  },
  /**
   * Page authorization gate
   * @param req
   * @param authOrSecDef
   * @param token
   * @param callback
   * @return {Promise<void>}
   * @constructor
   */
  Page: async function(req, authOrSecDef, token, callback) {
    let hasBasicAuthHeader = !(
        !req.headers.authorization ||
        req.headers.authorization.indexOf('Basic ') === -1
    );
    let pageId = req.swagger.params.id.value;
    let page = null;
    try {
      page = await req.db.collection('page').findOne({
        'security.page_id': pageId,
      });
    } catch (e) {
    }
    // add the page to the request. We dont want to query it again.
    req.page = page;
    // delete req.page.security;
    // delete req.page._id;

    // if the page doesn't exists pass to the controller.
    // it will handle 404
    if (!page) {
      callback();
      return;
    }

    const security = page.security;
    const isPublic = !security ||
        (security && security.security_level === 'public');
    const isProtected = security && security.security_level === 'protected';

    if (isPublic) {
      callback();
      return;
    }

    if (isProtected) {
      if (hasBasicAuthHeader) {
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').
            toString('ascii');
        // password can't contain any ':' character
        const [authPageId, authPassword] = credentials.split(':');
        const isAuthCorrect = authPageId === pageId &&
            authPassword === security.password;
        if (isAuthCorrect) {
          callback();
          return;
        }
        callback(new ApiError('Not authorized!', 403, 'not_authorized'));
        return;
      }
      callback(new ApiError('Not authorized!', 403, 'not_authorized'));
      return;
    }
    callback(new ApiError('Not published!', 403, 'not_published'));
  },
};
