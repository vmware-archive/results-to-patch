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

Q.prototype.pathOfTask = function(id) {
  var stories = this.stories;
  for (var storyIndex = 0; storyIndex < stories.length; storyIndex++) {
    var tasks = stories[storyIndex].tasks;
    for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
      if (tasks[taskIndex].id === id) return [storyIndex, taskIndex];
    }
  }
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

Q.prototype.pathOfEpicComment = function(id) {
  var epics = this.epics;
  for (var epicIndex = 0; epicIndex < epics.length; epicIndex++) {
    var comments = epics[epicIndex].comments;

    for (var commentIndex = 0; commentIndex < comments.length; commentIndex++) {
      if (comments[commentIndex].id === id) return [epicIndex, commentIndex];
    }
  }
}

module.exports = function(state) {
  return new Q(state);
};
