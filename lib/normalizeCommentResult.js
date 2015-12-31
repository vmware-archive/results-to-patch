const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (r.deleted) {
    return {type: resultTypes.COMMENT, id: r.id, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('text')) attrs.text = r.text;
    if (r.hasOwnProperty('person_id')) attrs.person = r.person_id;
    if (r.hasOwnProperty('created_at')) attrs.createdAt = r.created_at;
    if (r.hasOwnProperty('updated_at')) attrs.updatedAt = r.updated_at;
    if (r.hasOwnProperty('file_attachment_ids')) attrs.fileAttachments = r.file_attachment_ids;
    if (r.hasOwnProperty('google_attachment_ids')) attrs.googleAttachments = r.google_attachment_ids;
    if (r.hasOwnProperty('story_id')) attrs.story = r.story_id;
    if (r.hasOwnProperty('epic_id')) attrs.epic = r.epic_id;
    return {type: resultTypes.COMMENT, id: r.id, attrs: attrs};
  }
};


