'use strict';

module.exports = function(obj) {
  const copy = {};
  for (let key in obj) {
    if (obj[key]) copy[key] = obj[key];
  }
  return copy;
}
