var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var jsonPatch = require('fast-json-patch');

var helper = {
  project: function(version) {
    return helper.loadFixture(version + '_project').project;
  },

  command: function(version) {
    return helper.loadFixture(version + '_command');
  },

  loadFixture: function(searchString) {
      var globString = path.resolve(__dirname, '../json/' + searchString + '*.json'),
          file = _.first(glob.sync(globString)),
          text = fs.readFileSync(file, 'utf8');
      return JSON.parse(text);
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