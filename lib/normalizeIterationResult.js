const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (result.length === 'default') {
    return {type: resultTypes.ITERATION, id: r.number, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('length')) attrs.length = r.length;
    if (r.hasOwnProperty('team_strength')) attrs.teamStrength = r.team_strength;
    return {type: resultTypes.ITERATION, id: r.number, attrs: attrs};
  }
};
