module.exports = {
  up(db) {
      createCollectionUser(db);
  },

  down(db) {
    db.dropCollection('user');
  },
};

function createCollectionUser(db) {
  db.createCollection('user');
  db.collection('user').createIndex({email: 1}, {unique: true});
  db.command({collMod:'user',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'password', 'registration_date', 'details'],
        properties: {
          email: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          password: {
            bsonType: 'string',
            description: 'must be a string and is required',
          },
          registration_date: {
            bsonType: 'date',
            description: 'must be a date and is required',
          },
          details: {
            bsonType: 'object',
            required: ['first_name', 'last_name'],
            properties: {
              first_name: {
                bsonType: 'string',
                description: 'must be a string and is required',
              },
            },
          },
        },
      },
    },
  });
}
