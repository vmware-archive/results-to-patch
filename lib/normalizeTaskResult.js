const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (r.deleted) {
    return {type: resultTypes.TASK, id: r.id, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('description')) attrs.description = r.description;
    if (r.hasOwnProperty('complete')) attrs.complete = r.complete;
    if (r.hasOwnProperty('created_at')) attrs.createdAt = r.created_at;
    if (r.hasOwnProperty('updated_at')) attrs.updatedAt = r.updated_at;
    if (r.hasOwnProperty('position')) attrs.position = r.position;
    return {type: resultTypes.TASK, id: r.id, attrs: attrs};
  }
};
