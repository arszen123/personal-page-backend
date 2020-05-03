module.exports = {
  up(db) {
      createCollectionSkill(db);
  },

  down(db) {
    db.dropCollection('skill');
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
          }
        },
      },
    },
  });
}
