var _ = require('lodash');
var pointer = require('json-pointer');
var paths = require('./paths');
var jsonPatch = require('fast-json-patch');

function Project(json) {
  this.data = JSON.parse(JSON.stringify(json));
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
  // console.log(patch)
  this.log.push(patch);
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

Project.prototype.setTaskAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfStoryTask(id) + '/' + attr, value);
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

Project.prototype.pathOfCommentById = function(id) {
  var stories = this.data.stories;
  for (var i = 0; i < stories.length; i++) {
    var comments = stories[i].comments;
    for (var j = 0; j < comments.length; j++) {
      if (comments[j] && comments[j].id === id) {
        return paths.storyComment(i, j);
      }
    }
  }

  var epics = this.data.epics;
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
  var stories = this.data.stories;

  for (var i = 0, storiesLen = stories.length; i < storiesLen; i++) {
    var comments = stories[i].comments;

    for (var j = 0, commentsLen = comments.length; j < commentsLen; j++) {
      if (comments[j] && comments[j].id === id) {
        return [i, j];
      }
    }
  }
}

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

Project.prototype.overrideIterationNumbers = function() {
  return _.pluck(this.data.iteration_overrides, 'number');
};

Project.prototype.pathOfIterationOverrideByNumber = function(number) {
  var overrides = this.data.iteration_overrides;

  for (var i = 0; i < overrides.length; i++) {
    if (overrides[i].number === number) {
      return paths.iterationOverride(i);
    }
  }
};

module.exports = Project;