const actionTypes = require('./actionTypes');
const reduceProjects = require('./reduceProjects');
const reduceStories = require('./reduceStories');
const reduceComments = require('./reduceComments');

module.exports = function(state, action) {
  // console.log(JSON.stringify(state));
  // console.log(JSON.stringify(command, null, '  '));
  switch (action.type) {
    case actionTypes.RECEIVE_COMMAND:
      return {
        ...state,
        projects: reduceProjects(state.projects, action),
        stories: reduceStories(state.stories, action),
        comments: reduceComments(state.comments, action),
      };
    default:
      return state;
  }
}
