'use strict';

module.exports = class ObjectParser {
  static reduce(obj, schema) {
    let newObj = {};
    for (let i in schema) {
      if (typeof schema[i] === 'object') {
        newObj[i] = this.reduce(obj[i], schema[i]);
        continue;
      }
      newObj[schema[i]] = obj[schema[i]];
    }
    return newObj;
  }
};
