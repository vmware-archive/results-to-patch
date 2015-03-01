var pointer        = require('json-pointer');
var paths          = require('./paths');
var jsonPatch      = require('fast-json-patch');
var Immutable      = require('immutable');
var immpatch       = require('immpatch');
var immutablepatch = require('immutablepatch');
var compress       = require('./compress.js');

function Project(json) {
  this.data    = json;
  this.reverse = [];
  this.forward = [];
  this.eachIn = this.eachIn.bind(this);
}

Project.prototype.get = function(path) {
  var splitPath = this.splitPath_(path);
  if (this.data.hasIn(splitPath)) {
    return this.data.getIn(splitPath);
  }
};

Project.prototype.has = function(path) {
  return this.data.hasIn(this.splitPath_(path));
};

Project.prototype.opAdd = function(path, value) {
  this.reverse.unshift({op: 'remove', path: path});
  this.patch({op: 'add', path: path, value: Immutable.fromJS(value)});
};

Project.prototype.opReplace = function(path, value) {
  var oldValue = this.get(path);

  if (oldValue) {
    this.reverse.unshift({op: 'replace', path: path, value: oldValue});
  } else {
    this.reverse.unshift({op: 'remove', path: path});
  }
  this.patch({op: 'replace', path: path, value: Immutable.fromJS(value)});
};

Project.prototype.opRemove = function(path) {
  this.reverse.unshift({op: 'add', path: path, value: this.get(path)});
  this.patch({op: 'remove', path: path});
};

Project.prototype.opMove = function(path, from) {
  if (path !== from) {
    this.reverse.unshift({op: 'move', path: from, from: path});
    this.patch({op: 'move', path: path, from: from});
  }
};

Project.prototype.patch = function(patch) {
  this.forward.push(patch);
  this.data = immpatch(this.data, [patch]);
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
    paths.story(this.data.get('stories').count()),
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
  var lastIndex = this.get(tasksPath).count();
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
  var lastIndex = this.get(commentsPath).count();
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
  var lastIndex = this.data.get('labels').count();
  var path = paths.label(lastIndex);
  this.opAdd(path, {id: id});
};

Project.prototype.setLabelAttr = function(id, attr, value) {
  this.setPathAttr(this.pathOfLabel(id) + '/' + attr, value);
};

Project.prototype.moveLabel = function(id, newIndex) {
  var oldIndex = this.indexOfLabel(id);

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
    paths.epic(this.data.get('epics').count()),
    {id: id, comments: []}
  );
};

// ITERATION OVERRIDE
Project.prototype.deleteIterationOverride = function(number) {
  this.opRemove(this.pathOfIterationOverride(number));
};

Project.prototype.insertIterationOverride = function(number) {
  var index = this.data.get('iteration_overrides')
      .map(function(io) { return io.get('number') })
      .push(number)
      .sort()
      .indexOf(number);

  this.opAdd(paths.iterationOverride(index), {number: number, team_strength: 1.0});
};

Project.prototype.setIterationOverrideAttr = function(number, attr, value) {
  this.setPathAttr(this.pathOfIterationOverride(number) + '/' + attr, value);
};

Project.prototype.setPathAttr = function(path, value) {
  if (value === null) {
    this.opRemove(path);
  }
  else if (!this.has(path)) {
    this.opAdd(path, value);
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
  var index = -1;

  this.data.get('stories').forEach(function(story, i) {
    if (story.get('id') === id) {
      index = i;
      return false;
    }
  });

  return index;
};

Project.prototype.storyAtIndex = function(index) {
  return this.data.getIn(['stories', index, 'id']);
};

Project.prototype.hasEpic = function(id) {
  return this.indexOfEpic(id) !== -1;
};

Project.prototype.pathOfEpic = function(id) {
  return paths.epic(this.indexOfEpic(id));
};

Project.prototype.indexOfEpic = function(id) {
  var index = -1;

  this.data.get('epics').forEach(function(epic, i) {
    if (epic.get('id') === id) {
      index = i;
      return false;
    }
  });

  return index;
};

Project.prototype.hasFileAttachment = function(id) {
  return !!this.pathOfFileAttachment(id);
};

Project.prototype.pathOfFileAttachment = function(id) {
  return this.findIn(['stories', 'comments', 'file_attachments'], function(s, storyIndex, c, commentIndex, f, faIndex) {
    if (f.get('id') === id) {
      return paths.storyCommentFileAttachment(storyIndex, commentIndex, faIndex);
    }
  }) ||
  this.findIn(['epics', 'comments', 'file_attachments'], function(e, epicIndex, c, commentIndex, f, faIndex) {
    if (f.get('id') === id) {
      return paths.epicCommentFileAttachment(epicIndex, commentIndex, faIndex);
    }
  });
}

Project.prototype.hasGoogleAttachment = function(id) {
  return !!this.pathOfGoogleAttachment(id);
};

Project.prototype.pathOfGoogleAttachment = function(id) {
  return this.findIn(['stories', 'comments', 'google_attachments'], function(s, storyIndex, c, commentIndex, g, gaIndex) {
    if (g.get('id') === id) {
      return paths.storyCommentGoogleAttachment(storyIndex, commentIndex, gaIndex);
    }
  }) ||
  this.findIn(['epics', 'comments', 'google_attachments'], function(e, epicIndex, c, commentIndex, g, gaIndex) {
    if (g.get('id') === id) {
      return paths.epicCommentGoogleAttachment(epicIndex, commentIndex, gaIndex);
    }
  });
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
  var path;

  this.data.get('epics').forEach(function(epic, i1) {
    epic.get('comments').forEach(function(comment, i2) {
      if (comment.get('id') === id) {
        path = paths.epicComment(i1, i2);
        return false;
      }
    });
    if (path) { return false; }
  });

  return path;
}

Project.prototype.pathOfStoryComment = function(id) {
  return this.findIn(['stories', 'comments'], function(s, storyIndex, c, commentIndex) {
    if (c.get('id') === id) {
      return paths.storyComment(storyIndex, commentIndex);
    }
  });
}

Project.prototype.hasStoryComment = function(id) {
  return !!this.pathOfStoryComment(id);
};

Project.prototype.hasCommentFileAttachment = function(commentId, faId) {
  return !!this.pathOfFileAttachment(faId);
};

Project.prototype.hasStoryTask = function(id) {
  return !!this.pathOfStoryTask(id);
};

Project.prototype.indexOfStoryTask = function(id) {
  var indexes;

  this.data.get('stories').forEach(function(story, i1) {
    story.get('tasks').forEach(function(task, i2) {
      if (task.get('id') === id) {
        indexes = [i1, i2];
        return false;
      }
    });
    if (indexes) { return false; }
  });

  return indexes;
}

Project.prototype.pathOfStoryTask = function(id) {
  var path;

  this.data.get('stories').forEach(function(story, i1) {
    story.get('tasks').forEach(function(task, i2) {
      if (task.get('id') === id) {
        path = paths.storyTask(i1, i2);;
        return false;
      }
    });
    if (path) { return false; }
  });

  return path;
}

Project.prototype.labelNames = function() {
  return this.data.get('labels').map(function(l) {
    return l.get('name');
  });
};

Project.prototype.hasLabel = function(id) {
  return !!this.pathOfLabel(id);
};

Project.prototype.indexOfLabel = function(id) {
  var index;

  this.data.get('labels').forEach(function(label, i) {
    if (label.get('id') === id) {
      index = i;
      return false;
    }
  });

  return index;
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
  var path;

  this.data.get('iteration_overrides').forEach(function(iteration, i) {
    if (iteration.get('number') === number) {
      path = paths.iterationOverride(i);;
      return false;
    }
  });

  return path;
};

Project.prototype.splitPath_ = function(path) {
  return path.slice(1).split('/');
};

Project.prototype.findIn = function(path, callback) {
  var value;
  this.eachIn(path, function() {
    value = value || callback.apply(null, arguments);
  });
  return value;
};

Project.prototype.eachIn = function(path, callback, data_) {
  var eachIn = this.eachIn;

  if (!data_) {
    data_ = this.data;
  }

  switch (path.length) {
    case 0:
      return;

    case 1:
      data_.has(path[0]) && data_.get(path[0]).forEach(function(item, index) {
        callback(item, index);
      });
      return;

    default:
      data_.has(path[0]) && data_.get(path[0]).forEach(function(item, index) {
        eachIn(path.slice(1), callback.bind(null, item, index), item);
      });
      return;
  }
};

module.exports = Project;