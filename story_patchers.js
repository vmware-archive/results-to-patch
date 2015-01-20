var _ = require('lodash');

module.exports = {
  id:             buildAttrPatcher('id'),
  createdAt:      buildAttrPatcher('created_at'),
  updatedAt:      buildAttrPatcher('updated_at'),
  acceptedAt:     buildAttrPatcher('accepted_at'),
  estimate:       buildAttrPatcher('estimate'),
  storyType:      buildAttrPatcher('story_type'),
  name:           buildAttrPatcher('name'),
  description:    buildAttrPatcher('description'),
  currentState:   buildAttrPatcher('current_state'),
  requestedById:  buildAttrPatcher('requested_by_id'),
  ownerIds:       buildAttrPatcher('owner_ids'),
  labelIds:       buildAttrPatcher('label_ids'),
  tasks:          buildAttrPatcher('tasks'),
  followerIds:    buildAttrPatcher('follower_ids'),
  comments:       buildAttrPatcher('comments'),
  ownedById:      buildAttrPatcher('owned_by_id'),
  move:           movePatcher
};

function buildAttrPatcher(attr) {
  var filterFn = attrResultFilter.bind(null, attr);

  return function(project, command) {
    command.results.filter(filterFn).reduce(patchAttrResult)
    // return result.type === 'story' && result.hasOwnProperty(key);
  }
  return attrPatcher.bind(null, attr);
}

function attrResultFilter(key, result) {
  return result.type === 'story' && result.hasOwnProperty(key);
}

function patchAttrResult(project, memo, result) {
  var index = indexOfStory(project, result.id);
  var storyPath = '/stories/' + index;
  var original = project.stories[index];

  if (result[key]) {
    if (!original[key]) {
      patch.push({op: 'add', path: storyPath + '/' + key, value: result[key]});
    }
    else if (result[key] !== original[key]) {
      patch.push({op: 'replace', path: storyPath + '/' + key, value: result[key]});
    }
  }
}

// function attrPatcher(key, project, command) {
//   return command.results.filter(function(r) {}).forEach();

//   return patch;
// }

function indexOfStory(project, id) {
  var stories = project.stories;
  var storiesLen = stories.length;

  for (var i = 0; i < storiesLen; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
};

function movePatcher(project, command) {
  var patch    = [];
  var results  = command.results.filter(function(r) { return r.type === 'story' && (r.after_id || r.before_id)});
  var origStoryIds = _.pluck(project.stories, 'id');
  var movedStoryIds = _.difference(origStoryIds, _.pluck(results, 'id'));

  if (results.length === 0) {
    return [];
  }

  function move(result) {
    var storyPath = '/stories/' + origStoryIds.indexOf(result.id);
    var index = movedStoryIds.indexOf(result.after_id) + 1;
    movedStoryIds.splice(index, 0, result.id);
    results = _.without(results, result);
    patch.push({op: 'move', path: '/stories/' + index, from: storyPath});
  }

  var nextToMove = _.find(results, function(r) {
    return movedStoryIds.indexOf(r.after_id) !== -1;
  });
  move(nextToMove);

  while (results.length) {
    nextToMove = _.findWhere(results, {after_id: nextToMove.id});
    move(nextToMove);
  }
  return patch;
}