var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');

function loadFile(groupedSnapshots, filepath) {
  var dirname = path.dirname(filepath);
  var basename = path.basename(filepath);
  groupedSnapshots[dirname] = groupedSnapshots[dirname] || {name: path.basename(dirname)};
  groupedSnapshots[dirname][basename] = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  return groupedSnapshots;
}

function isValidSnapshot(snapshot) {
  return snapshot.hasOwnProperty('before.json') &&
         snapshot.hasOwnProperty('after.json') &&
         snapshot.hasOwnProperty('command.json');
}

function deepFreeze(obj) {
  var propNames = Object.getOwnPropertyNames(obj);

  propNames.forEach(function(name) {
    var prop = obj[name];
    if (prop && typeof prop == 'object' && !Object.isFrozen(prop))
      deepFreeze(prop);
  });

  return Object.freeze(obj);
}

module.exports = {
  load: function(pattern) {
    return _.chain(glob.sync(pattern, {}))
      .reduce(loadFile, {})
      .values()
      .filter(isValidSnapshot)
      .map(deepFreeze)
      .value();
  },
};
