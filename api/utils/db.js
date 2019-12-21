const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = `mongodb://${process.env.DB_URI}:${process.env.DB_PORT}`;

// Database Name
const dbName = process.env.DB_NAME;

const options = {
  auth: {
    user: process.env.DB_AUTH_USERNAME,
    password: process.env.DB_AUTH_PASSWORD,
  }
};

module.exports = {
// Use connect method to connect to the server
  createDbConnection: function (req, res, next) {
    MongoClient.connect(url, options, function(err, client) {
      if (err) {
        console.log(err);
        throw new Error("Can't connect to database");
      }
      req.dbClient = client;
      req.db = client.db(dbName);

      next();
    });
  },
  closeDbConnection: function(req, res, next) {
    if (req.dbClient) {
      req.dbClient.close();
    }
    next();
  }
};
