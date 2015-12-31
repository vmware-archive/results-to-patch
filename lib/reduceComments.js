'use strict';
const actionTypes = require('./actionTypes');
const resultTypes = require('./resultTypes');
const compact = require('./util/compact');
const reduceObj = require('./util/reduceObj');

function reduceComment(state, action) {
  const id = state.id;

  switch (action.type) {
    case actionTypes.RECEIVE_COMMAND:
      const result = action.command.results[resultTypes.COMMENT][state.id];

      if (result.deleted) {
        return null;
      } else {
        return {
          ...state,
          ...result,
        };
      }

    default:
      return state;
  }


}

function eachCommentResultId(state, action, callback) {

}

module.exports = function(state, action) {
  switch (action.type) {

    case actionTypes.RECEIVE_COMMAND:
      const results = action.command.results[resultTypes.COMMENT];

      return reduceObj(results, (nextState, result, id) => ({
        [id]: reduceComment(nextState[id] || {id: id}, action),
        ...nextState,
      }), state);

    default:
      return state;
  }
};


// module.exports = function(state, action) {
//   switch (action.type) {
//     case actionTypes.RECEIVE_COMMAND:
//       return reduceObj(action.command.results[resultTypes.COMMENT], (nextState, value) => {
//         return {
//           [r.id]: reduceComment(nextState[r.id] || {}, action),
//           ...state,
//         };
//       }, nextState);

//     default:
//       return state;
//   }
// };
