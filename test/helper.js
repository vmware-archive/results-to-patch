var fs        = require('fs');
var path      = require('path');
var _         = require('lodash');
var jsonPatch = require('fast-json-patch');

var helper = {
  loadSnapshot: function(name) {
    var snapshotPath = path.resolve(__dirname, 'fixtures/' + name);

      return {
        name: name,
        before: helper.loadJSON(snapshotPath + '/before.json'),
        after: helper.loadJSON(snapshotPath+ '/after.json'),
        command: helper.loadJSON(snapshotPath+ '/command.json')
      }
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