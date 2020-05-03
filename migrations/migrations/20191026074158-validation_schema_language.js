module.exports = {
  up(db) {
      createCollectionLanguage(db);
  },

  down(db) {
    db.dropCollection('language');
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
