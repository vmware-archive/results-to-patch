var _ = require('lodash');
var pointer = require('json-pointer');

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

Project.prototype.indexOfStoryById = function(id) {
  var stories = this.json_.stories;

  for (var i = 0, len = stories.length; i < len; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
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

Project.prototype.labelNames = function() {
  return _.pluck(this.json_.labels, 'name');
};

module.exports = Project;