const MongoClient = require('mongodb').MongoClient;


const url = `mongodb+srv://${process.env.DB_AUTH_USERNAME}:${process.env.DB_AUTH_PASSWORD}@${process.env.DB_URI}`;
// Database Name
const dbName = process.env.DB_NAME;

const options = {
  useNewUrlParser: true
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
