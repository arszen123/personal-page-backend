'use strict';

const _ = require('lodash-compat');

function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return toString.call(value)
}

_.isFunction = function (value) {
  if (!_.isObject(value)) {
    return false
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = getTag(value);
  return tag === '[object Function]' || tag === '[object AsyncFunction]' ||
      tag === '[object GeneratorFunction]' || tag === '[object Proxy]'
};
