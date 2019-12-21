module.exports = {
  up(db) {
    // TODO write your migration here. Return a Promise (and/or use async & await).
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
      createCollectionLanguage(db);
  },

  down(db) {
    db.dropCollection('language');
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

function createCollectionLanguage(db) {
  db.createCollection('language');
  db.collection('language').createIndex({userId: 1});
  db.command({collMod:'language',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'lang_id', 'lang_level_id'],
        properties: {
          lang_id: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          lang_level_id: {
            bsonType: 'string',
            description: 'must be a string and is required',
            /*$in: [
              'basic',
              'conversant',
              'proficient',
              'fluent',
              'native',
              'bilingual',
            ],*/
          },
        },
      },
    },
  });
}
