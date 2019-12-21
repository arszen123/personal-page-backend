// In this file you can configure migrate-mongo

const config = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    // url: "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb",
    url: "mongodb://127.0.0.1:27017",
    // url: 'mongodb://' + process.env.DB_URI + ':' + process.env.DB_ PORT,
    // url: 'mongodb://db:27017',


    // TODO Change this to your database name:
    databaseName: process.env.DB_NAME || 'dbname',

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
      auth: {
        user: 'root',
        password: 'root'
      }
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",
  // migrationsDir: process.env.MIGRATIONS_PATH,

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog"
};

//Return the config as a promise
module.exports = config;
