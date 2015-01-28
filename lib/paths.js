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
  label: function(labelIndex) {
    return '/labels/' + labelIndex;
  },
  iterationOverride: function(iterationIndex) {
    return '/iteration_overrides/' + iterationIndex;
  }
};