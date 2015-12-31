const actionTypes = require('./actionTypes');

function reduceProject(state, action) {
  switch (action.type) {

    case actionTypes.RECEIVE_COMMAND:
      return {
        ...state,
        version: action.command.version,
      };

    default:
      return state;
  }
  ``
  return {
    ...state,
    version: action.version,
  }
};


module.exports = function(state, action) {
  switch (action.type) {

    case actionTypes.RECEIVE_COMMAND:
      return {
        ...state,
        [action.command.project]: reduceProject(state[action.command.project], action),
      };

    default:
      return state;
  }
};
