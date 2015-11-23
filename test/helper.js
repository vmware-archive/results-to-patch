var fs         = require('fs');
var path       = require('path');
var glob       = require('glob');
var _          = require('lodash');
var jsonPatch  = require('fast-json-patch');
var normalizer = require('../lib/normalizer');

function loadSnapshotFile(groupedSnapshots, filepath) {
  var dirname = path.dirname(filepath);
  var basename = path.basename(filepath);
  groupedSnapshots[dirname] = groupedSnapshots[dirname] || {name: path.basename(dirname)};
  groupedSnapshots[dirname][basename] = helper.loadJSON(filepath);
  return groupedSnapshots;
}

function isValidSnapshot(snapshot) {
  return snapshot.hasOwnProperty('before.json') &&
         snapshot.hasOwnProperty('after.json') &&
         snapshot.hasOwnProperty('command.json');
}

function normalize(snapshot) {
  return {
    'before.json': normalizer(snapshot['before.json']),
    'after.json': normalizer(snapshot['after.json']),
    'command.json': snapshot['command.json'],
  };
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

var helper = {
  snapshots: function(pattern) {
    return _.chain(glob.sync(pattern, {}))
      .reduce(loadSnapshotFile, {})
      .values()
      .filter(isValidSnapshot)
      .map(normalize)
      .map(deepFreeze)
      .value();
  },

  loadJSON: function(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  },

  clone: function(json) {
    return JSON.parse(JSON.stringify(json));
  },

  patch: function(original, patch) {
    var patched = helper.clone(original);
    jsonPatch.apply(patched, patch);
    return patched;
  },

  indexOfStory: function(project, id) {
    var stories = project.stories;
    var storiesLen = stories.length;

    for (var i = 0; i < storiesLen; i++) {
      if (stories[i].id === id) {
        return i;
      }
    }
    return -1;
  }
};

module.exports = helper;
