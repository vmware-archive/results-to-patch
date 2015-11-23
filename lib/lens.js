var R = require('ramda');

var lens = {
  // versionLens: R.lensProp('version'),
  // projects: R.lensProp('projects'),

  // iterationOverridesLens: R.lensProp('iteration_overrides'),

  labelsLens: R.lensProp('labels'),

  storiesLens: R.lensProp('stories'),

  epicsLens: R.lensProp('epics'),

  project: function(id) {
    return R.pipe(
      R.lensProp(id),
      R.lensProp('projects')
    );
  },

  iterationOverride: function(id) {
    return R.pipe(
      R.lensProp(id),
      R.lensProp('iterationOverrides')
    );

    // return R.compose(
    //   this.iterationOverridesLens,
    //   R.lensIndex(iterationOverridesIndex)
    // );
  },

  labelLens: function(labelIndex) {
    return R.compose(
      this.labelsLens,
      R.lensIndex(labelIndex)
    );
  },

  storyLens: function(storyIndex) {
    return R.compose(
      this.storiesLens,
      R.lensIndex(storyIndex)
    );
  },

  storyTasksLens: function(storyIndex) {
    return R.compose(
      this.storyLens(storyIndex),
      R.lensProp('tasks')
    );
  },

  storyTaskLens: function(storyIndex, taskIndex) {
    return R.compose(
      this.storyTasksLens(storyIndex),
      R.lensIndex(taskIndex)
    );
  },

  storyCommentsLens: function(storyIndex) {
    return R.compose(
      this.storyLens(storyIndex),
      R.lensProp('comments')
    );
  },

  storyCommentLens: function(storyIndex, commentIndex) {
    return R.compose(
      this.storyCommentsLens(storyIndex),
      R.lensIndex(commentIndex)
    );
  },

  epicLens: function(epicIndex) {
    return R.compose(
      this.epicsLens,
      R.lensIndex(epicIndex)
    );
  },

  epicCommentsLens: function(epicIndex) {
    return R.compose(
      this.epicLens(epicIndex),
      R.lensProp('comments')
    );
  },

  epicCommentLens: function(epicIndex, commentIndex) {
    return R.compose(
      this.epicCommentsLens(epicIndex),
      R.lensIndex(commentIndex)
    );
  },

  commentLens: function(state, commentId) {
    var q = Q(state);
    if (q.isStoryComment(commentId)) {
      var path = q.pathOfStoryComment(commentId);
      return this.storyCommentLens(path[0], path[1]);
    } else {
      var path = q.pathOfEpicComment(commentId);
      return this.epicCommentLens(path[0], path[1]);
    }
  },

  fileAttachmentsLens: function(state, commentId) {
    return R.compose(
      this.commentLens(state, commentId),
      R.lensProp('file_attachments')
    );
  },

  epicCommentFileAttachmentLens: function(epicIndex, commentIndex, fileAttachmentIndex) {
    return R.compose(
      this.epicCommentsLens(epicIndex),
      R.lensIndex(commentIndex)
    );
  },

  storyCommentFileAttachmentLens: function(storyIndex, commentIndex, fileAttachmentIndex) {
    return R.compose(
      this.storyCommentsLens(storyIndex),
      R.lensIndex(commentIndex)
    );
  },

  fileAttachmentLens: function(state, fileAttachmentId) {
    var q = Q(state);
    if (q.isStoryFileAttachment(fileAttachmentId)) {
      var path = q.pathOfStoryFileAttachment(fileAttachmentId);
      return this.storyCommentLens(path[0], path[1]);
    } else {
      var path = q.pathOfEpicFileAttachment(fileAttachmentId);
      return this.epicCommentLens(path[0], path[1]);
    }

    // return R.compose(
    //   this.commentLens(state, commentId),
    //   R.lensProp('file_attachments')
    // );
  },

  googleAttachmentsLens: function(state, commentId) {
    return R.compose(
      this.commentLens(state, commentId),
      R.lensProp('google_attachments')
    );
  },
};

module.exports = lens;
