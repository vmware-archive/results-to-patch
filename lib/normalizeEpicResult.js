const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (r.deleted) {
    return {type: resultTypes.EPIC, id: r.id, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('created_at')) attrs.createdAt = r.created_at;
    if (r.hasOwnProperty('updated_at')) attrs.updatedAt = r.updated_at;
    if (r.hasOwnProperty('name')) attrs.name = r.name;
    if (r.hasOwnProperty('description')) attrs.description = r.description;
    if (r.hasOwnProperty('follower_ids')) attrs.followers = r.follower_ids;
    if (r.hasOwnProperty('label_id')) attrs.label = r.label_id;
    if (r.hasOwnProperty('past_done_stories_count')) attrs.pastDoneStoriesCount = r.past_done_stories_count;
    if (r.hasOwnProperty('past_done_stories_no_point_count')) attrs.pastDoneStoriesNoPointCount = r.past_done_stories_no_point_count;
    if (r.hasOwnProperty('past_done_story_estimates')) attrs.pastDoneStoryEstimates = r.past_done_story_estimates;
    return {type: resultTypes.EPIC, id: r.id, attrs: attrs};
  }
};
