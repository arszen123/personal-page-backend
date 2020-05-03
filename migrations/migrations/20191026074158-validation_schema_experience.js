module.exports = {
  up(db) {
      createCollectionExperience(db);
  },

  down(db) {
    db.dropCollection('experience');
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
