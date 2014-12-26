module.exports = createPatcher([
  storyId,
  storyCreatedAt,
  storyUpdatedAt,
  storyAcceptedAt,
  storyAttr('accepted_at'),
  storyAttr('estimate'),
  storyAttr('story_type'),
  storyAttr('name'),
  storyAttr('description'),
  storyAttr('current_state'),
  storyAttr('requested_by_id'),
  storyAttr('owner_ids'),
  storyAttr('label_ids'),
  storyAttr('tasks'),
  storyAttr('follower_ids'),
  storyAttr('comments'),
  storyAttr('owned_by_id'),
  storyMoves,
  projectVersion
]);

function storyId(project, command) {
  return patchStoryAttr('id', project, command);
}

function storyCreatedAt(project, command) {
  return patchStoryAttr('created_at', project, command);
}

function storyUpdatedAt(project, command) {
  return patchStoryAttr('updated_at', project, command);
}

function storyAcceptedAt(project, command) {
  return patchStoryAttr('accepted_at', project, command);
}

function projectVersion(project, command) {
  return [{op: 'replace', path: '/version', value: command.project.version}];
}

function storyMoves(project, command) {
  var patch = [];

  command.results.forEach(function(result) {
    var index = indexOfStory(project, result.id);
    var storyPath = '/stories/' + index;

    if (result.after_id) {
      var afterIndex = indexOfStory(project, result.after_id) + 1;
      patch.push({op: 'move', path: '/stories/' + afterIndex, from: storyPath});
    }
    else if (result.before_id) {
      var beforeIndex = indexOfStory(project, result.before_id);
      patch.push({op: 'move', path: '/stories/' + beforeIndex, from: storyPath});
    }
  });

  return patch;
}

function patchStoryAttr(attr, project, command) {
  var patch = [];

  command.results.forEach(function(result) {
    var index = indexOfStory(project, result.id);
    var storyPath = '/stories/' + index;
    var original = project.stories[index];

    if (result[attr]) {
      if (!original[attr]) {
        patch.push({op: 'add', path: storyPath + '/' + attr, value: result[attr]});
      }
      else if (result[attr] !== original[attr]) {
        patch.push({op: 'replace', path: storyPath + '/' + attr, value: result[attr]});
      }
    }
  });

  return patch;
}

function storyAttr(attr) {
  return function(project, command) {
    var patch = [];

    command.results.forEach(function(result) {
      var index = indexOfStory(project, result.id);
      var storyPath = '/stories/' + index;
      var original = project.stories[index];

      if (result[attr]) {
        if (!original[attr]) {
          patch.push({op: 'add', path: storyPath + '/' + attr, value: result[attr]});
        }
        else if (result[attr] !== original[attr]) {
          patch.push({op: 'replace', path: storyPath + '/' + attr, value: result[attr]});
        }
      }
    });

    return patch;
  }
}

function createPatcher(patchers) {
  return function(project, command) {
    return patchers.reduce(function(patch, patcher) {
      return patch.concat(patcher(project, command));
    }, []);
  }
}

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

