var _ = require('lodash');
var pointer = require('json-pointer');
var paths = require('./paths');
var jsonPatch = require('fast-json-patch');

function Project(json) {
  this.data = deepClone(json);
  this.log = [];
}

Project.prototype.get = function(path) {
  if (this.has(path)) {
    return pointer.get(this.data, path);
  }
};

Project.prototype.has = function(path) {
  return pointer.has(this.data, path);
};

Project.prototype.opAdd = function(path, value) {
  this.patch({op: 'add', path: path, value: value});
};

Project.prototype.opReplace = function(path, value) {
  this.patch({op: 'replace', path: path, value: value});
};

Project.prototype.opRemove = function(path) {
  this.patch({op: 'remove', path: path});
};

Project.prototype.opMove = function(path, from) {
  this.patch({op: 'move', path: path, from: from});
};

Project.prototype.patch = function(patch) {
  this.log.push(deepClone(patch))
  // console.log(patch)
  jsonPatch.apply(this.data, [patch]);
};


// VERSION
Project.prototype.updateVersion = function(version) {
  this.opReplace(paths.version(), version);
};

// STORY
Project.prototype.appendStory = function(id) {
  var lastIndex = this.data.stories.length;

  this.opAdd(
    paths.story(lastIndex),
    {id: id, tasks: [], comments: []}
  );
};

Project.prototype.deleteStory = function(id) {
  this.opRemove(this.pathOfStory(id));
};

Project.prototype.moveStoryBefore = function(id, beforeId) {
  var index = this.indexOfStory(id);
  var beforeIndex = this.indexOfStory(beforeId);

  if (index < beforeIndex) {
    beforeIndex--;
  }

  this.opMove(
    paths.story(beforeIndex),
    paths.story(index)
  );
};

Project.prototype.moveStoryAfter = function(id, afterId) {
  var index = this.indexOfStory(id);
  var beforeIndex = this.indexOfStory(afterId) + 1;

  if (index < beforeIndex) {
    beforeIndex--;
  }

  this.opMove(
    paths.story(beforeIndex),
    paths.story(index)
  );
};

Project.prototype.setStoryAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfStory(id) + '/' + attr, value);
};

// TASK
Project.prototype.deleteTask = function(id) {
  this.opRemove(this.pathOfStoryTask(id));
};

Project.prototype.appendTask = function(storyId, id) {
  var tasksPath = this.pathOfStory(storyId) + '/tasks';
  var lastIndex = this.get(tasksPath).length;
  var path = tasksPath + '/' + lastIndex;

  this.opAdd(path, {id: id});
};

Project.prototype.setStoryTaskAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfStoryTask(id) + '/' + attr, value);
};

// STORY COMMENT
Project.prototype.appendStoryComment = function(storyId, id) {
  var commentsPath = this.pathOfStory(storyId) + '/comments';
  var lastIndex = this.get(commentsPath).length;
  var path = commentsPath + '/' + lastIndex;

  this.opAdd(path, {id: id, file_attachments: [], google_attachments: []});
};

Project.prototype.setStoryCommentAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfStoryComment(id) + '/' + attr, value);
};

// LABEL
Project.prototype.appendLabel = function(id) {
  var lastIndex = this.data.labels.length;
  var path = paths.label(lastIndex);
  this.opAdd(path, {id: id});
};

Project.prototype.setLabelAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfLabel(id) + '/' + attr, value);
};

Project.prototype.moveLabel = function(id, newIndex) {
  var oldIndex = this.indexOfLabel(id);

  if (oldIndex < newIndex) {
    newIndex--;
  }

  this.opMove(
    paths.label(newIndex),
    paths.label(oldIndex)
  );
};

// ITERATION OVERRIDE
Project.prototype.deleteIterationOverride = function(number) {
  this.opRemove(this.pathOfIterationOverride(number));
};

Project.prototype.insertIterationOverride = function(number) {
  var index = _.sortedIndex(this.data.iteration_overrides, {number: number}, 'number');
  this.opAdd(paths.iterationOverride(index), {number: number, team_strength: 1.0});
};

Project.prototype.setIterationOverrideAttr = function(number, attr, value) {
  this.setPathAttr(this.pathOfIterationOverride(number) + '/' + attr, value);
};




Project.prototype.setPathAttr = function(path, value) {
  if (!this.has(path)) {
    this.opAdd(path, value);
  }
  else if (_.isNull(value)) {
    this.opRemove(path);
  }
  else if (value !== this.get(path)) {
    this.opReplace(path, value);
  }
};


Project.prototype.pathOfStory = function(id) {
  return paths.story(this.indexOfStory(id));
};

Project.prototype.hasStory = function(id) {
  return this.indexOfStory(id) !== -1;
};

Project.prototype.indexOfStory = function(id) {
  var stories = this.data.stories;

  for (var i = 0, len = stories.length; i < len; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.storyAtIndex = function(index) {
  return this.data.stories[index] && this.data.stories[index].id;
};

Project.prototype.pathOfEpicById = function(id) {
  return paths.epic(this.indexOfEpicById(id));
};

Project.prototype.indexOfEpicById = function(id) {
  var epics = this.data.epics;

  for (var i = 0, len = epics.length; i < len; i++) {
    if (epics[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.storyById = function(id) {
  return this.data.stories[this.indexOfStory(id)];
};

// Project.prototype.pathOfCommentById = function(id) {
//   var stories = this.data.stories;
//   for (var i = 0; i < stories.length; i++) {
//     var comments = stories[i].comments;
//     for (var j = 0; j < comments.length; j++) {
//       if (comments[j] && comments[j].id === id) {
//         return paths.storyComment(i, j);
//       }
//     }
//   }

//   var epics = this.data.epics;
//   for (var m = 0; m < epics.length; m++) {
//     var comments = epics[m].comments;
//     for (var n = 0; n < comments.length; n++) {
//       if (comments[n] && comments[n].id === id) {
//         return paths.epicComment(m, n);
//       }
//     }
//   }
// }

Project.prototype.pathOfStoryComment = function(id) {
  var stories = this.data.stories;
  for (var i = 0; i < stories.length; i++) {
    var comments = stories[i].comments;
    for (var j = 0; j < comments.length; j++) {
      if (comments[j] && comments[j].id === id) {
        return paths.storyComment(i, j);
      }
    }
  }
}

Project.prototype.hasStoryComment = function(id) {
  return !!this.pathOfStoryComment(id);
};

Project.prototype.hasStoryTask = function(id) {
  return !!this.pathOfStoryTask(id);
};

Project.prototype.indexOfStoryTask = function(id) {
  var stories = this.data.stories;

  for (var i = 0, storiesLen = stories.length; i < storiesLen; i++) {
    var tasks = stories[i].tasks;

    for (var j = 0, tasksLen = tasks.length; j < tasksLen; j++) {
      if (tasks[j] && tasks[j].id === id) {
        return [i, j];
      }
    }
  }
}

Project.prototype.pathOfStoryTask = function(id) {
  var stories = this.data.stories;

  for (var i = 0; i < stories.length; i++) {
    var tasks = stories[i].tasks;

    for (var j = 0; j < tasks.length; j++) {
      if (tasks[j] && tasks[j].id === id) {
        return paths.storyTask(i, j);
      }
    }
  }
}

Project.prototype.storyIds = function() {
  return _.pluck(this.data.stories, 'id');
};

Project.prototype.storyBeforeIds = function() {
  var stories = this.data.stories;
  var beforeIds = {};

  var end = stories.length - 1;
  for (var i = 0; i < end; i++) {
    beforeIds[stories[i].id] = stories[i + 1].id;
  }

  if (stories.length) {
    beforeIds[stories[end].id] = -1;
  }

  return beforeIds;
};

Project.prototype.labelNames = function() {
  return _.pluck(this.data.labels, 'name');
};

Project.prototype.hasLabel = function(id) {
  return !!this.pathOfLabel(id);
};

Project.prototype.indexOfLabel = function(id) {
  var labels = this.data.labels;

  for (var i = 0, len = labels.length; i < len; i++) {
    if (labels[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.pathOfLabel = function(id) {
  var index = this.indexOfLabel(id);
  if (index !== -1) {
    return paths.label(index);
  }
}

Project.prototype.overrideIterationNumbers = function() {
  return _.pluck(this.data.iteration_overrides, 'number');
};

Project.prototype.hasIterationOverride = function(number) {
  return !!this.pathOfIterationOverride(number);
};

Project.prototype.pathOfIterationOverride = function(number) {
  var overrides = this.data.iteration_overrides;

  for (var i = 0; i < overrides.length; i++) {
    if (overrides[i].number === number) {
      return paths.iterationOverride(i);
    }
  }
};

function deepClone(json) {
  return JSON.parse(JSON.stringify(json));
}

module.exports = Project;