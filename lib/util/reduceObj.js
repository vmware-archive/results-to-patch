'use strict';

module.exports = function(obj, callback, result) {
  if (obj) {
    for (let key in obj) {
      result = callback(result, obj[key], key);
    }
  }

  return result;
}
