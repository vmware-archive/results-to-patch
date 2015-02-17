var pointer = require('json-pointer');
var paths = require('./paths');
var jsonPatch = require('fast-json-patch');

function Project(json) {
  this.data = this.deepClone_(json);
  this.reverse = [];
  this.forward = [];
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
  this.reverse.unshift({op: 'remove', path: path});
  this.patch({op: 'add', path: path, value: value});
};

Project.prototype.opReplace = function(path, value) {
  var oldValue = this.get(path);
  if (oldValue) {
    this.reverse.unshift({op: 'replace', path: path, value: oldValue});
  } else {
    this.reverse.unshift({op: 'remove', path: path});
  }
  this.patch({op: 'replace', path: path, value: value});
};

Project.prototype.opRemove = function(path) {
  this.reverse.unshift({op: 'add', path: path, value: this.get(path)});
  this.patch({op: 'remove', path: path});
};

Project.prototype.opMove = function(path, from) {
  this.reverse.unshift({op: 'move', path: from, from: path});
  this.patch({op: 'move', path: path, from: from});
};

Project.prototype.patch = function(patch) {
  this.forward.push(patch);
  jsonPatch.apply(this.data, [this.deepClone_(patch)]);
};

Project.prototype.patches = function() {
  return this.forward;
};

// VERSION
Project.prototype.updateVersion = function(version) {
  this.opReplace(paths.version(), version);
};

// STORY
Project.prototype.appendStory = function(id) {
  this.opAdd(
    paths.story(this.data.stories.length),
    {id: id, tasks: [], comments: []}
  );
};

Project.prototype.deleteStory = function(id) {
  this.opRemove(this.pathOfStory(id));
};

Project.prototype.moveStoryBefore = function(id, beforeId) {
  this.moveStory(id, this.indexOfStory(beforeId));
};

Project.prototype.moveStoryAfter = function(id, afterId) {
  this.moveStory(id, this.indexOfStory(afterId) + 1);
};

Project.prototype.moveStory = function(id, toIndex) {
  var index = this.indexOfStory(id);

  if (index < toIndex) {
    toIndex--;
  }

  this.opMove(
    paths.story(toIndex),
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

Project.prototype.moveTask = function(id, newIndex) {
  var index = this.indexOfStoryTask(id);

  this.opMove(
    paths.storyTask(index[0], newIndex),
    paths.storyTask(index[0], index[1])
  );
};

// STORY COMMENT
Project.prototype.deleteComment = function(id) {
  this.opRemove(this.pathOfComment(id));
};

Project.prototype.appendComment = function(parentPath, id) {
  var commentsPath = parentPath + '/comments';
  var lastIndex = this.get(commentsPath).length;
  var path = commentsPath + '/' + lastIndex;

  this.opAdd(path, {id: id, file_attachments: [], google_attachments: []});
};

Project.prototype.appendCommentFileAttachment = function(commentId, faId, index) {
  this.opAdd(this.pathOfComment(commentId) + '/file_attachments/' + index, {id: faId});
};

Project.prototype.appendGoogleAttachment = function(commentId, gaId, index) {
  this.opAdd(this.pathOfComment(commentId) + '/google_attachments/' + index, {id: gaId});
};

Project.prototype.setFileAttachmentAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfFileAttachment(id) + '/' + attr, value);
};

Project.prototype.setGoogleAttachmentAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfGoogleAttachment(id) + '/' + attr, value);
};

Project.prototype.setCommentAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfComment(id) + '/' + attr, value);
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

  // if (oldIndex < newIndex) {
  //   newIndex--;
  // }

  this.opMove(
    paths.label(newIndex),
    paths.label(oldIndex)
  );
};

// EPIC
Project.prototype.setEpicAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfEpic(id) + '/' + attr, value);
};

Project.prototype.moveEpicBefore = function(id, beforeId) {
  this.moveEpic(id, this.indexOfEpic(beforeId));
};

Project.prototype.moveEpicAfter = function(id, afterId) {
  this.moveEpic(id, this.indexOfEpic(afterId) + 1);
};

Project.prototype.moveEpic = function(id, toIndex) {
  var index = this.indexOfEpic(id);

  if (index < toIndex) {
    toIndex--;
  }

  this.opMove(
    paths.epic(toIndex),
    paths.epic(index)
  );
};

Project.prototype.deleteEpic = function(id) {
  this.opRemove(this.pathOfEpic(id));
};

Project.prototype.appendEpic = function(id) {
  this.opAdd(
    paths.epic(this.data.epics.length),
    {id: id, comments: []}
  );
};

// ITERATION OVERRIDE
Project.prototype.deleteIterationOverride = function(number) {
  this.opRemove(this.pathOfIterationOverride(number));
};

Project.prototype.insertIterationOverride = function(number) {
  var numbers = this.data.iteration_overrides.map(function(io) { return io.number; });
  numbers.push(number);
  numbers.sort();
  var index = numbers.indexOf(number);
  this.opAdd(paths.iterationOverride(index), {number: number, team_strength: 1.0});
};

Project.prototype.setIterationOverrideAttr = function(number, attr, value) {
  this.setPathAttr(this.pathOfIterationOverride(number) + '/' + attr, value);
};

Project.prototype.setPathAttr = function(path, value) {
  if (value === null) {
    this.opRemove(path);
  } else if (value !== this.get(path)) {
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

  for (var i = 0, iLen = stories.length; i < iLen; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.storyAtIndex = function(index) {
  return this.data.stories[index] && this.data.stories[index].id;
};

Project.prototype.hasEpic = function(id) {
  return this.indexOfEpic(id) !== -1;
};

Project.prototype.pathOfEpic = function(id) {
  return paths.epic(this.indexOfEpic(id));
};

Project.prototype.indexOfEpic = function(id) {
  var epics = this.data.epics;

  for (var i = 0, len = epics.length; i < len; i++) {
    if (epics[i].id === id) {
      return i;
    }
  }
  return -1;
};

Project.prototype.hasFileAttachment = function(id) {
  return !!this.pathOfFileAttachment(id);
};

Project.prototype.pathOfFileAttachment = function(id) {
  var stories = this.data.stories;

  for (var i = 0, iLen = stories.length; i < iLen; i++) {
    var comments = stories[i].comments;

    for (var j = 0, jLen = comments.length; j < jLen; j++) {
      var fileAttachments = comments[j].file_attachments;

      for (var k = 0, kLen = fileAttachments.length; k < kLen; k++) {
        if (fileAttachments[k].id === id) {
          return paths.storyCommentFileAttachment(i, j, k);
        }
      }
    }
  }

  var epics = this.data.epics;

  for (var m = 0, mLen = epics.length; m < mLen; m++) {
    var comments = epics[m].comments;

    for (var n = 0, nLen = comments.length; n < nLen; n++) {
      var fileAttachments = comments[j].file_attachments;

      for (var o = 0, oLen = fileAttachments.length; o < oLen; o++) {
        if (fileAttachments[k].id === id) {
          return paths.epicCommentFileAttachment(m, n, o);
        }
      }
    }
  }
}

Project.prototype.hasGoogleAttachment = function(id) {
  return !!this.pathOfGoogleAttachment(id);
};

Project.prototype.pathOfGoogleAttachment = function(id) {
  var stories = this.data.stories;

  for (var i = 0, iLen = stories.length; i < iLen; i++) {
    var comments = stories[i].comments;

    for (var j = 0, jLen = comments.length; j < jLen; j++) {
      var googleAttachments = comments[j].google_attachments;

      for (var k = 0, kLen = googleAttachments.length; k < kLen; k++) {
        if (googleAttachments[k].id === id) {
          return paths.storyCommentGoogleAttachment(i, j, k);
        }
      }
    }
  }

  var epics = this.data.epics;

  for (var m = 0, mLen = epics.length; m < mLen; m++) {
    var comments = epics[m].comments;

    for (var n = 0, nLen = comments.length; n < nLen; n++) {
      var googleAttachments = comments[j].google_attachments;

      for (var o = 0, oLen = googleAttachments.length; o < oLen; o++) {
        if (googleAttachments[k].id === id) {
          return paths.epicCommentGoogleAttachment(m, n, o);
        }
      }
    }
  }
}


Project.prototype.hasComment = function(id) {
  return !!this.pathOfComment(id);
};

Project.prototype.pathOfComment = function(id) {
  return this.pathOfStoryComment(id) || this.pathOfEpicComment(id);
};

Project.prototype.hasEpicComment = function(id) {
  return !!this.pathOfEpicComment(id);
};

Project.prototype.pathOfEpicComment = function(id) {
  var epics = this.data.epics;

  for (var i = 0, iLen = epics.length; i < iLen; i++) {
    var comments = epics[i].comments;

    for (var j = 0, jLen = comments.length; j < jLen; j++) {
      if (comments[j] && comments[j].id === id) {
        return paths.epicComment(i, j);
      }
    }
  }
}

Project.prototype.pathOfStoryComment = function(id) {
  var stories = this.data.stories;

  for (var i = 0, iLen = stories.length; i < iLen; i++) {
    var comments = stories[i].comments;

    for (var j = 0, jLen = comments.length; j < jLen; j++) {
      if (comments[j] && comments[j].id === id) {
        return paths.storyComment(i, j);
      }
    }
  }
}

Project.prototype.hasStoryComment = function(id) {
  return !!this.pathOfStoryComment(id);
};

Project.prototype.hasCommentFileAttachment = function(commentId, faId) {
  var fileAttachments = this.get(this.pathOfComment(commentId)).file_attachments;

  for (var i = 0, iLen = fileAttachments.length; i < iLen; i++) {
    if (fileAttachments[i].id === faId) {
      return true;
    }
  }

  return false;
};

Project.prototype.hasStoryTask = function(id) {
  return !!this.pathOfStoryTask(id);
};

Project.prototype.indexOfStoryTask = function(id) {
  var stories = this.data.stories;

  for (var i = 0, iLen = stories.length; i < iLen; i++) {
    var tasks = stories[i].tasks;

    for (var j = 0, jLen = tasks.length; j < jLen; j++) {
      if (tasks[j] && tasks[j].id === id) {
        return [i, j];
      }
    }
  }
}

Project.prototype.pathOfStoryTask = function(id) {
  var stories = this.data.stories;

  for (var i = 0, iLen = stories.length; i < iLen; i++) {
    var tasks = stories[i].tasks;

    for (var j = 0, jLen = tasks.length; j < jLen; j++) {
      if (tasks[j] && tasks[j].id === id) {
        return paths.storyTask(i, j);
      }
    }
  }
}

Project.prototype.labelNames = function() {
  return this.data.labels.map(function(l) {
    return l.name;
  });
};

Project.prototype.hasLabel = function(id) {
  return !!this.pathOfLabel(id);
};

Project.prototype.indexOfLabel = function(id) {
  var labels = this.data.labels;

  for (var i = 0, iLen = labels.length; i < iLen; i++) {
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

Project.prototype.hasIterationOverride = function(number) {
  return !!this.pathOfIterationOverride(number);
};

Project.prototype.pathOfIterationOverride = function(number) {
  var overrides = this.data.iteration_overrides;

  for (var i = 0, iLen = overrides.length; i < iLen; i++) {
    if (overrides[i].number === number) {
      return paths.iterationOverride(i);
    }
  }
};

Project.prototype.deepClone_ = function(json) {
  return JSON.parse(JSON.stringify(json));
};

module.exports = Project;