module.exports = {
  up(db) {
    // TODO write your migration here. Return a Promise (and/or use async & await).
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
      createCollectionExperience(db);
  },

  down(db) {
    db.dropCollection('experience');
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

function createCollectionExperience(db) {
  db.createCollection('experience');
  db.collection('experience').createIndex({_id: 1, userId: 1});
  db.command({collMod:'experience',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'company_name', 'position', 'from'],
        properties: {
          company_name: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          position: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          is_current: {
            bsonType: 'bool',
            description: 'must be a boolean',
          },
          description: {
            bsonType: 'string',
            description: 'must be a string',
          },
          from: {
            bsonType: 'date',
            description: 'must be a date and is required',
          },
          to: {
            bsonType: 'date',
            description: 'must be a date',
          },
        },
      },
    },
  });
}
