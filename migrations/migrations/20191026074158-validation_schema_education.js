module.exports = {
  up(db) {
    // TODO write your migration here. Return a Promise (and/or use async & await).
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
      createCollectionEducation(db);
  },

  down(db) {
    db.dropCollection('education');
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

function createCollectionEducation(db) {
  db.createCollection('education');
  db.collection('education').createIndex({_id: 1, userId: 1});
  db.command({collMod:'education',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'institute', 'specialization', 'from', 'to'],
        properties: {
          type: {
            bsonType: 'string',
            description: 'must be a string and is required',
            // $in: ['base', 'high', 'uni', 'online'],
          },
          institute: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          specialization: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          from: {
            bsonType: 'date',
            description: 'must be a date and is required',
          },
          to: {
            bsonType: 'date',
            description: 'must be a date and is required',
          },
        },
      },
    },
  });
}
