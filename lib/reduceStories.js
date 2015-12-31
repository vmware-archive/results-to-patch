'use strict';
const resultTypes = require('./resultTypes');

function reduceStory(state, r) {
  if (r.deleted) {
    return null;
  } else {
    return {
      ...state,
      ...r.attrs,
    };
  }
}

module.exports = function(state, command) {
  return state;
  // return compact(command.results
  //   .filter((r) => r.type === resultTypes.STORY)
  //   .reduce((nextState, r) => ({
  //     ...nextState,
  //     [r.id]: reduceStory(nextState[r.id] || {}, r)
  //   }), state));
};
