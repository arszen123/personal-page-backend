module.exports = {
  up(db) {
    // TODO write your migration here. Return a Promise (and/or use async & await).
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
      createCollectionSkill(db);
  },

  down(db) {
    db.dropCollection('skill');
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

function createCollectionSkill(db) {
  db.createCollection('skill');
  db.collection('skill').createIndex({userId: 1}, {unique: true});
  db.command({collMod:'skill',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'skills'],
        properties: {
          skills: {
            bsonType: 'array',
            description: 'must be a string and is required',
            items: {
              bsonType: 'string',
            },
          },
          userId: {
            bsonType: 'string',
          }
        },
      },
    },
  });
}