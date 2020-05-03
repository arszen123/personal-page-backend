module.exports = {
  up(db) {
      createCollectionEducation(db);
  },

  down(db) {
    db.dropCollection('education');
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
