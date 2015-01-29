var _ = require('lodash');
var pointer = require('json-pointer');
var paths = require('./paths');

function Project(json) {
  this.json_ = json;
  this.indexOfStoryById = _.memoize(this.indexOfStoryById);
  this.storyById = _.memoize(this.storyById);
  this.indexOfStoryCommentById = _.memoize(this.indexOfStoryCommentById);
}

Project.prototype.get = function(path) {
  if (pointer.has(this.json_, path)) {
    return pointer.get(this.json_, path);
  }
};

Project.prototype.has = function(path) {
  return pointer.has(this.json_, path);
};

Project.prototype.pathOfStoryById = function(id) {
  return paths.story(this.indexOfStoryById(id));
};

Project.prototype.indexOfStoryById = function(id) {
  var stories = this.json_.stories;

  for (var i = 0, len = stories.length; i < len; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.pathOfEpicById = function(id) {
  return paths.epic(this.indexOfEpicById(id));
};

Project.prototype.indexOfEpicById = function(id) {
  var epics = this.json_.epics;

  for (var i = 0, len = epics.length; i < len; i++) {
    if (epics[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.storyById = function(id) {
  return this.json_.stories[this.indexOfStoryById(id)];
};

Project.prototype.pathOfCommentById = function(id) {
  var stories = this.json_.stories;
  for (var i = 0; i < stories.length; i++) {
    var comments = stories[i].comments;
    for (var j = 0; j < comments.length; j++) {
      if (comments[j] && comments[j].id === id) {
        return paths.storyComment(i, j);
      }
    }
  }

  var epics = this.json_.epics;
  for (var m = 0; m < epics.length; m++) {
    var comments = epics[m].comments;
    for (var n = 0; n < comments.length; n++) {
      if (comments[n] && comments[n].id === id) {
        return paths.epicComment(m, n);
      }
    }
  }
}

Project.prototype.indexOfStoryCommentById = function(id) {
  var stories = this.json_.stories;

  for (var i = 0, storiesLen = stories.length; i < storiesLen; i++) {
    var comments = stories[i].comments;

    for (var j = 0, commentsLen = comments.length; j < commentsLen; j++) {
      if (comments[j] && comments[j].id === id) {
        return [i, j];
      }
    }
  }
}

Project.prototype.indexOfStoryTaskById = function(id) {
  var stories = this.json_.stories;

  for (var i = 0, storiesLen = stories.length; i < storiesLen; i++) {
    var tasks = stories[i].tasks;

    for (var j = 0, tasksLen = tasks.length; j < tasksLen; j++) {
      if (tasks[j] && tasks[j].id === id) {
        return [i, j];
      }
    }
  }
}

Project.prototype.pathOfStoryTaskById = function(id) {
  var stories = this.json_.stories;

  for (var i = 0; i < stories.length; i++) {
    var tasks = stories[i].tasks;

    for (var j = 0; j < tasks.length; j++) {
      if (tasks[j] && tasks[j].id === id) {
        return paths.storyTask(i, j);
        // return [i, j];
      }
    }
  }
}

Project.prototype.storyIds = function() {
  return _.pluck(this.json_.stories, 'id');
};

Project.prototype.storyBeforeIds = function() {
  var stories = this.json_.stories;
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
  return _.pluck(this.json_.labels, 'name');
};

Project.prototype.overrideIterationNumbers = function() {
  return _.pluck(this.json_.iteration_overrides, 'number');
};

Project.prototype.pathOfIterationOverrideByNumber = function(number) {
  var overrides = this.json_.iteration_overrides;

  for (var i = 0; i < overrides.length; i++) {
    if (overrides[i].number === number) {
      return paths.iterationOverride(i);
    }
  }
};

module.exports = Project;