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
  }
};