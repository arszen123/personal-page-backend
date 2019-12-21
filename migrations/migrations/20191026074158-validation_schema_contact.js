module.exports = {
  up(db) {
    // TODO write your migration here. Return a Promise (and/or use async & await).
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
      createCollectionContact(db);
  },

  down(db) {
    db.dropCollection('contact');
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

function createCollectionContact(db) {
  // db.createCollection('contact');
  db.collection('contact').createIndex({_id: 1, userId: 1});
  db.command({collMod:'contact',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'value'],
        properties: {
          type: {
            bsonType: 'string',
            description: 'must be a string and is required',
            /*$in: [
              'email',
              'phone',
              'url',
              'other',
            ],*/
          },
          other_type: {
            bsonType: 'string',
            description: 'must be a string',
          },
          value: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
        },
      },
    },
  });
}
