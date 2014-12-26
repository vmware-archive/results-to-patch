var pointer = require('json-pointer');
var _ = require('lodash');

module.exports = function(project, command) {
  var patch = [];
  var results = command.results;
  var resultsLen = results.length;

  for (var i = 0; i < resultsLen; i++) {
    var result = results[i]
    var index = indexOfStory(project, result.id);
    var original = project.stories[index];
    var storyPath = '/stories/' + index;

    function patchAttr(attr) {
      if (result[attr]) {
        if (!original[attr]) {
          patch.push({op: 'add', path: storyPath + '/' + attr, value: result[attr]});
        }
        else if (result[attr] !== original[attr]) {
          patch.push({op: 'replace', path: storyPath + '/' + attr, value: result[attr]});
        }
      }
    }

    patchAttr('id');
    patchAttr('created_at');
    patchAttr('updated_at');
    patchAttr('accepted_at');
    patchAttr('estimate');
    patchAttr('story_type');
    patchAttr('name');
    patchAttr('description');
    patchAttr('current_state');
    patchAttr('requested_by_id');
    patchAttr('owner_ids');
    patchAttr('label_ids');
    patchAttr('tasks');
    patchAttr('follower_ids');
    patchAttr('comments');
    patchAttr('owned_by_id');

    if (result.after_id) {
      var afterIndex = indexOfStory(project, result.after_id) + 1;
      patch.push({op: 'move', path: '/stories/' + afterIndex, from: storyPath});
    }
    else if (result.before_id) {
      var beforeIndex = indexOfStory(project, result.before_id);
      patch.push({op: 'move', path: '/stories/' + beforeIndex, from: storyPath});
    }
  }

  var version = pointer.get(command, '/project/version');
  patch.push({op: 'replace', path: '/version', value: command.project.version});

  return patch;
};

function indexOfStory(project, id) {
  var stories = project.stories;
  var storiesLen = stories.length;

  for (var i = 0; i < storiesLen; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
};

