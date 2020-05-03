module.exports = {
  up(db) {
      createCollectionContact(db);
  },

  down(db) {
    db.dropCollection('contact');
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
