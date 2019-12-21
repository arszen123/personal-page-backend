const mm = require('migrate-mongo');
const up = mm.up;
const database = mm.database;

async function doUp() {
  const db = await database.connect();
  const migrated = await up(db);
  migrated.forEach(fileName => console.log('Migrated:', fileName));
}
doUp()
  .then(() => console.log('Done!'))
    .catch((e) => console.log(e))
;
