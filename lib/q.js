function Q(state) {
  this.state = state;
  this.stories = state.stories;
  this.epics = state.epics;
}

Q.prototype.indexOfStory = function(id) {
  for (var i = 0; i < this.stories.length; i++) {
    if (this.stories[i].id === id) return i;
  }
  return -1;
}

Q.prototype.storyAtIndex = function(index) {
  return this.stories[index] && this.stories[index].id;
}

Q.prototype.indexOfEpic = function(id) {
  for (var i = 0; i < this.epics.length; i++) {
    if (this.epics[i].id === id) return i;
  }
  return -1;
}

Q.prototype.indexOfIterationOverride = function(number) {
  for (var i = 0; i < this.state.iteration_overrides.length; i++) {
    if (this.state.iteration_overrides[i].number === number) return i;
  }
  return -1;
}

Q.prototype.pathOfTask = function(id) {
  var stories = this.stories;
  for (var storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    var tasks = stories[storyIndex].tasks;
    for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
      if (tasks[taskIndex].id === id) return [storyIndex, taskIndex];
    }
  }
}

Q.prototype.isStoryComment = function(id) {
  return this.pathOfStoryComment(id) ? true : false;
}

Q.prototype.isStoryFileAttachment = function(id) {
  return this.pathOfStoryFileAttachment(id) ? true : false;
}

Q.prototype.isStoryGoogleAttachment = function(id) {
  return this.pathOfStoryGoogleAttachment(id) ? true : false;
}

Q.prototype.pathOfStoryComment = function(id) {
  var stories = this.stories;
  for (var storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    var comments = stories[storyIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      if (comments[commentIndex].id === id) return [storyIndex, commentIndex];
    }
  }
}

Q.prototype.pathOfStoryFileAttachment = function(id) {
  var stories = this.stories;

  for (var storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    var comments = stories[storyIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      var fileAttachments = comments[commentIndex].file_attachments;

      for (var fileAttachmentIndex = 0; fileAttachmentIndex < fileAttachments.length; fileAttachmentIndex++) {

        if (fileAttachments[fileAttachmentIndex].id === id) return [storyIndex, commentIndex, fileAttachmentIndex];
      }
    }
  }
}

Q.prototype.pathOfStoryGoogleAttachment = function(id) {
  var stories = this.stories;

  for (var storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    var comments = stories[storyIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      var googleAttachments = comments[commentIndex].google_attachments;

      for (var googleAttachmentIndex = 0; googleAttachmentIndex < googleAttachments.length; googleAttachmentIndex++) {

        if (googleAttachments[googleAttachmentIndex].id === id) return [storyIndex, commentIndex, googleAttachmentIndex];
      }
    }
  }
}

Q.prototype.pathOfEpicComment = function(id) {
  var epics = this.epics;
  for (var epicIndex = 0; epicIndex < epics.length; epicIndex++) {
    var comments = epics[epicIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      if (comments[commentIndex].id === id) return [epicIndex, commentIndex];
    }
  }
}

Q.prototype.pathOfEpicFileAttachment = function(id) {
  var epics = this.epics;

  for (var epicIndex = 0; epicIndex < epics.length; epicIndex++) {
    var comments = epics[epicIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      var fileAttachments = comments[commentIndex].file_attachments;

      for (var fileAttachmentIndex = 0; fileAttachmentIndex < fileAttachments.length; fileAttachmentIndex++) {

        if (fileAttachments[fileAttachmentIndex].id === id) return [epicIndex, commentIndex, fileAttachmentIndex];
      }
    }
  }
}

Q.prototype.pathOfEpicGoogleAttachment = function(id) {
  var epics = this.epics;

  for (var epicIndex = 0; epicIndex < epics.length; epicIndex++) {
    var comments = epics[epicIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      var googleAttachments = comments[commentIndex].google_attachments;

      for (var googleAttachmentIndex = 0; googleAttachmentIndex < googleAttachments.length; googleAttachmentIndex++) {

        if (googleAttachments[googleAttachmentIndex].id === id) return [epicIndex, commentIndex, googleAttachmentIndex];
      }
    }
  }
}


module.exports = function(state) {
  return new Q(state);
};
