module.exports = {
  version: function() {
    return '/version'
  },
  story: function(storyIndex) {
    return '/stories/' + storyIndex;
  },
  storyAttr: function(storyIndex, attr) {
    return '/stories/' + storyIndex + '/' + attr;
  },
  storyComment: function(storyIndex, commentIndex) {
    return '/stories/' + storyIndex + '/comments/' + commentIndex;
  },
  storyCommentFileAttachment: function(storyIndex, commentIndex, fileAttachmentIndex) {
    return '/stories/' + storyIndex + '/comments/' + commentIndex + '/file_attachments/' + fileAttachmentIndex;
  },
  storyCommentGoogleAttachment: function(storyIndex, commentIndex, googleAttachmentIndex) {
    return '/stories/' + storyIndex + '/comments/' + commentIndex + '/google_attachments/' + googleAttachmentIndex;
  },
  storyTask: function(storyIndex, taskIndex) {
    return '/stories/' + storyIndex + '/tasks/' + taskIndex;
  },
  epic: function(epicIndex) {
    return '/epics/' + epicIndex;
  },
  epicAttr: function(epicIndex, attr) {
    return '/epics/' + epicIndex + '/' + attr;
  },
  epicComment: function(epicIndex, commentIndex) {
    return '/epics/' + epicIndex + '/comments/' + commentIndex;
  },
  epicCommentFileAttachment: function(epicIndex, commentIndex, fileAttachmentIndex) {
    return '/epic/' + epicIndex + '/comments/' + commentIndex + '/file_attachments/' + fileAttachmentIndex;
  },
  epicCommentGoogleAttachment: function(epicIndex, commentIndex, googleAttachmentIndex) {
    return '/epic/' + epicIndex + '/comments/' + commentIndex + '/google_attachments/' + googleAttachmentIndex;
  },
  label: function(labelIndex) {
    return '/labels/' + labelIndex;
  },
  iterationOverride: function(iterationIndex) {
    return '/iteration_overrides/' + iterationIndex;
  }
};