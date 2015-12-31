const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (r.deleted) {
    return {type: resultTypes.LABEL, id: r.id, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('name')) attrs.name = r.name;
    if (r.hasOwnProperty('created_at')) attrs.createdAt = r.created_at;
    if (r.hasOwnProperty('updated_at')) attrs.updatedAt = r.updated_at;
    return {type: resultTypes.LABEL, id: r.id, attrs: attrs};
  }
};
