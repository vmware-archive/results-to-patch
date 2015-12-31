const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (r.deleted || r.moved) {
    return {type: resultTypes.STORY, id: r.id, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('created_at')) attrs.createdAt = r.created_at;
    if (r.hasOwnProperty('updated_at')) attrs.updatedAt = r.updated_at;
    if (r.hasOwnProperty('accepted_at')) attrs.acceptedAt = r.accepted_at;
    if (r.hasOwnProperty('integration_id')) attrs.integration = r.integration_id;
    if (r.hasOwnProperty('deadline')) attrs.deadline = r.deadline;
    if (r.hasOwnProperty('story_type')) attrs.storyType = r.story_type;
    if (r.hasOwnProperty('name')) attrs.name = r.name;
    if (r.hasOwnProperty('description')) attrs.description = r.description;
    if (r.hasOwnProperty('current_state')) attrs.currentState = r.current_state;
    if (r.hasOwnProperty('requested_by_id')) attrs.requestedBy = r.requested_by_id;
    if (r.hasOwnProperty('owner_ids')) attrs.owners = r.owner_ids;
    if (r.hasOwnProperty('label_ids')) attrs.labels = r.label_ids;
    if (r.hasOwnProperty('follower_ids')) attrs.followers = r.follower_ids;
    if (r.hasOwnProperty('owned_by_id')) attrs.ownedBy = r.owned_by_id;
    if (r.hasOwnProperty('estimate')) attrs.estimate = (r.estimate === -1 ? null : r.estimate);
    if (r.hasOwnProperty('external_id')) attrs.external = (r.external_id === '' ? null : r.external_id);
    return {type: resultTypes.STORY, id: r.id, attrs: attrs};
  }
};
