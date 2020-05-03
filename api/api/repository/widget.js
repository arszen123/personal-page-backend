'use strict';

const ObjectId = require('mongodb').ObjectId;

module.exports = {
  deleteWidget,
};

async function deleteWidget(db, userId, entityId, entityType) {
  const page = await db.collection('page').findOne({
    userId: ObjectId(userId),
  });
  if (page === null) {
    return;
  }
  const oldWidgets = page.page;
  const newWidgets = [];
  for (let id in oldWidgets) {
    if (oldWidgets[id].element === entityId && oldWidgets[id].type === entityType) {
      continue;
    }
    newWidgets.push(oldWidgets[id]);
  }
  await db.collection('page').updateOne({
    userId: ObjectId(userId),
  }, {
    $set: {
      page: newWidgets,
    },
  });
}
