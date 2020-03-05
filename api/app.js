'use strict';
/*
* @TODO Rewrite this whole swagger-express-mw
*   Full of vulnerability and can't migrate up.
* */
require('./utils/hack');
const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const swaggerUi = require('swagger-ui-express');
const dbExpress = require('./utils/db');
const errorHandler = require('./utils/api-error-handler');
module.exports = app; // for testing
const ObjectId = require('mongodb').ObjectId;
const dotenv = require('dotenv');
const JWTHelper = require('./api/helpers/jwt-helper');
dotenv.config();

const config = {
  appRoot: __dirname // required config
  ,swaggerSecurityHandlers: {
    OAuth2: function (req, authOrSecDef, scopesOrApiKey, callback) {
      console.log('call');
      callback(new Error('Api key missing or not registered'));

      return;
    },
    Bearer: async function(req, authOrSecDef, token, callback) {
      let userId;
      let data = JWTHelper.verify(token);
      if (data === null) {
        return callback(new Error('Auth error'));
      }
      userId = data.user_id;
      req.auth = {
        user_id: userId
      };
      callback();
    },
  }
};
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: 'http://127.0.0.1:8080/swagger',
        name: 'Spec1'
      }
    ],
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, swaggerUiOptions));
app.use((req, res, next) => {
  res.oJson = res.json;
  res.oSend = res.send;
  res.json = function() {
    req.dbClient.close();
    this.oJson(...arguments);
  };
  res.send = function() {
    req.dbClient.close();
    this.oSend(...arguments);
  };
  next();
});

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  app.use(errorHandler.registerErrorHandler);
  app.use(dbExpress.createDbConnection);
  swaggerExpress.register(app);
  app.use(dbExpress.closeDbConnection);

  const port = process.env.PORT || 8080;
  app.listen(port);
});
