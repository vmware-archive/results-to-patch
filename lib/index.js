var Project = require('./project');
var assign = require('object-assign');
var reducer = require('./reducer');
var Q = require('./q');
var R = require('ramda');

function updateVersionAction(version) {
  return {type: reducer.UPDATE_VERSION, version: version};
}

function deleteStoryFilter(r) {
  return r.type === 'story' && (r.deleted || r.moved);
}

function deleteStoryAction(r) {
  return {type: reducer.DELETE_STORY, id: r.id};
}

function createStoryFilter(r) {
  return r.type === 'story' && !(r.deleted || r.moved) && r.project_id;
}

function createStoryAction(r) {
  return {type: reducer.CREATE_STORY, id: r.id};
}

function updateStoryFilter(r) {
  return r.type === 'story' && !(r.deleted || r.moved);
}

function updateStoryAction(r) {
  var attrs = {};
  if (r.hasOwnProperty('created_at')) attrs.created_at = r.created_at;
  if (r.hasOwnProperty('updated_at')) attrs.updated_at = r.updated_at;
  if (r.hasOwnProperty('accepted_at')) attrs.accepted_at = r.accepted_at;
  if (r.hasOwnProperty('integration_id')) attrs.integration_id = r.integration_id;
  if (r.hasOwnProperty('deadline')) attrs.deadline = r.deadline;
  if (r.hasOwnProperty('story_type')) attrs.story_type = r.story_type;
  if (r.hasOwnProperty('name')) attrs.name = r.name;
  if (r.hasOwnProperty('description')) attrs.description = r.description;
  if (r.hasOwnProperty('current_state')) attrs.current_state = r.current_state;
  if (r.hasOwnProperty('requested_by_id')) attrs.requested_by_id = r.requested_by_id;
  if (r.hasOwnProperty('owner_ids')) attrs.owner_ids = r.owner_ids;
  if (r.hasOwnProperty('label_ids')) attrs.label_ids = r.label_ids;
  if (r.hasOwnProperty('follower_ids')) attrs.follower_ids = r.follower_ids;
  if (r.hasOwnProperty('owned_by_id')) attrs.owned_by_id = r.owned_by_id;
  if (r.hasOwnProperty('estimate')) attrs.estimate = (r.estimate === -1 ? null : r.estimate);
  if (r.hasOwnProperty('external_id')) attrs.external_id = (r.external_id === '' ? null : r.external_id);
  return {type: reducer.UPDATE_STORY, id: r.id, attrs: attrs};
}

function deleteTaskFilter(r) {
  return r.type === 'task' && r.deleted;
}

function deleteTaskAction(r) {
  return {type: reducer.DELETE_TASK, id: r.id};
}

function createTaskFilter(r) {
  return r.type === 'task' && r.story_id && !r.deleted;
}

function createTaskAction(r) {
  return {type: reducer.CREATE_TASK, id: r.id, storyId: r.story_id};
}

function moveTaskFilter(r) {
  return r.type === 'task' && !r.deleted && r.position;
}

function moveTaskAction(r) {
  return {type: reducer.MOVE_TASK, id: r.id, position: r.position};
}

function updateTaskFilter(r) {
  return r.type === 'task' && !r.deleted;
}

function updateTaskAction(r) {
  var attrs = {};
  if (r.hasOwnProperty('description')) attrs.description = r.description;
  if (r.hasOwnProperty('complete')) attrs.complete = r.complete;
  if (r.hasOwnProperty('created_at')) attrs.created_at = r.created_at;
  if (r.hasOwnProperty('updated_at')) attrs.updated_at = r.updated_at;
  return {type: reducer.UPDATE_TASK, id: r.id, attrs: attrs};
}

function deleteEpicFilter(r) {
  return r.type === 'epic' && r.deleted;
}

function deleteEpicAction(r) {
  return {type: reducer.DELETE_EPIC, id: r.id};
}

function createEpicFilter(r) {
  return r.type === 'epic' && !r.deleted && r.project_id;
}

function createEpicAction(r) {
  return {type: reducer.CREATE_EPIC, id: r.id};
}

function updateEpicFilter(r) {
  return r.type === 'epic' && !r.deleted;
}

function updateEpicAction(r) {
  var attrs = {};
  if (r.hasOwnProperty('created_at')) attrs.created_at = r.created_at;
  if (r.hasOwnProperty('updated_at')) attrs.updated_at = r.updated_at;
  if (r.hasOwnProperty('name')) attrs.name = r.name;
  if (r.hasOwnProperty('description')) attrs.description = r.description;
  if (r.hasOwnProperty('follower_ids')) attrs.follower_ids = r.follower_ids;
  if (r.hasOwnProperty('label_id')) attrs.label_id = r.label_id;
  if (r.hasOwnProperty('past_done_stories_count')) attrs.past_done_stories_count = r.past_done_stories_count;
  if (r.hasOwnProperty('past_done_stories_no_point_count')) attrs.past_done_stories_no_point_count = r.past_done_stories_no_point_count;
  if (r.hasOwnProperty('past_done_story_estimates')) attrs.past_done_story_estimates = r.past_done_story_estimates;
  return {type: reducer.UPDATE_EPIC, id: r.id, attrs: attrs};
}

function createLabelFilter(r) {
  return r.type === 'label' && !r.deleted && r.project_id;
}

function createLabelAction(r) {
  return {type: reducer.CREATE_LABEL, id: r.id};
}

function updateLabelFilter(r) {
  return r.type === 'label' && !r.deleted;
}

function updateLabelAction(r) {
  var attrs = {};
  if (r.hasOwnProperty('name')) attrs.name = r.name;
  if (r.hasOwnProperty('created_at')) attrs.created_at = r.created_at;
  if (r.hasOwnProperty('updated_at')) attrs.updated_at = r.updated_at;
  return {type: reducer.UPDATE_LABEL, id: r.id, attrs: attrs};
}

function deleteCommentFilter(r) {
  return r.type === 'comment' && r.deleted;
}

function deleteCommentAction(r) {
  return {type: reducer.DELETE_COMMENT, id: r.id};
}

function createCommentFilter(r) {
  return r.type === 'comment' && (r.story_id || r.epic_id) && !r.deleted;
}

function createCommentAction(r) {
  if (r.story_id) {
    return {type: reducer.CREATE_COMMENT, id: r.id, storyId: r.story_id};
  } else {
    return {type: reducer.CREATE_COMMENT, id: r.id, epicId: r.epic_id};
  }
}

function updateCommentFilter(r) {
  return r.type === 'comment' && !r.deleted;
}

function updateCommentAction(r) {
  var attrs = {};
  if (r.hasOwnProperty('text')) attrs.text = r.text;
  if (r.hasOwnProperty('person_id')) attrs.person_id = r.person_id;
  if (r.hasOwnProperty('created_at')) attrs.created_at = r.created_at;
  if (r.hasOwnProperty('updated_at')) attrs.updated_at = r.updated_at;
  if (r.hasOwnProperty('file_attachment_ids')) attrs.file_attachment_ids = r.file_attachment_ids;
  if (r.hasOwnProperty('google_attachment_ids')) attrs.google_attachment_ids = r.google_attachment_ids;
  return {type: reducer.UPDATE_COMMENT, id: r.id, attrs: attrs};
}

function updateIterationOverrideFilter(r) {
  return r.type === 'iteration' && r.length !== 'default';
}

function updateIterationOverrideAction(r) {
  var attrs = {};
  if (r.hasOwnProperty('length')) attrs.length = r.length;
  if (r.hasOwnProperty('team_strength')) attrs.team_strength = r.team_strength;
  return {type: reducer.UPDATE_ITERATION_OVERRIDE, number: r.number, attrs: attrs};
}

function deleteIterationOverrideFilter(r) {
  return r.type === 'iteration' && r.length === 'default';
}

function deleteIterationOverrideAction(r) {
  return {type: reducer.DELETE_ITERATION_OVERRIDE, number: r.number};
}

function storiesMoveAction(results) {
  var getStories = R.pipe(
    R.filter(R.whereEq({type: 'story'})),
    R.map(R.pick(['id', 'after_id', 'before_id']))
  );

  var stories = getStories(results);
  var ids = R.map(R.prop('id'), stories);

  var rejectBatchIds = R.reject(R.contains(R.__, ids));
  var compact = R.filter(R.identity);
  var pluckProperty = R.useWith(R.map, [R.prop, R.identity]);

  var getNonBatchId = R.compose(
    R.last,
    rejectBatchIds,
    compact,
    pluckProperty
  );

  var afterId = getNonBatchId('after_id', stories);
  var beforeId = getNonBatchId('before_id', stories);

  if (afterId || beforeId) {
    return {type: reducer.MOVE_STORIES, afterId: afterId, beforeId: beforeId, storyIds: ids};
  } else {
    return [];
  }
}

function parse(state, command) {
  var results = command.results;
  var version = command.project.version;

  state = [].concat(
    updateVersionAction(version),
    results.filter(deleteCommentFilter).map(deleteCommentAction),
    results.filter(deleteTaskFilter ).map(deleteTaskAction ),
    results.filter(deleteEpicFilter ).map(deleteEpicAction ),
    results.filter(deleteStoryFilter).map(deleteStoryAction),
    results.filter(createStoryFilter).map(createStoryAction),
    results.filter(updateStoryFilter).map(updateStoryAction),
    results.filter(createTaskFilter ).map(createTaskAction ),
    results.filter(moveTaskFilter   ).map(moveTaskAction   ),
    results.filter(updateTaskFilter ).map(updateTaskAction ),
    results.filter(createEpicFilter ).map(createEpicAction ),
    results.filter(updateEpicFilter ).map(updateEpicAction ),
    results.filter(createLabelFilter).map(createLabelAction),
    results.filter(updateLabelFilter).map(updateLabelAction),
    results.filter(createCommentFilter).map(createCommentAction),
    results.filter(updateCommentFilter).map(updateCommentAction),
    results.filter(updateIterationOverrideFilter).map(updateIterationOverrideAction),
    results.filter(deleteIterationOverrideFilter).map(deleteIterationOverrideAction),
    storiesMoveAction(results)
  ).reduce(reducer, state);

  state = fileAttachmentAttr(state, command);
  state = googleAttachmentAttr(state, command);
  state = epicMove(state, command);
  state = labelMove(state, command);

  return state;
};

function fileAttachmentAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'file_attachment' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'filename',
        'uploader_id',
        'created_at',
        'content_type',
        'size',
        'download_url',
        'uploaded',
        'thumbnailable',
        'height',
        'width',
        'thumbnail_url',
        'big_url'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setFileAttachmentAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
};


function googleAttachmentAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'google_attachment' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'google_kind',
        'person_id',
        'resource_id',
        'alternate_link',
        'google_id',
        'title'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setGoogleAttachmentAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
};

function labelMove(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'label' && !r.deleted && r.name;
    })
    .sort(sortBy(function(r) {
      return r.name;
    }))
    .forEach(function(r) {
      var newIndex = project.labelNames().sort().indexOf(r.name);
      project.moveLabel(r.id, newIndex);
    });
  return project.data;
}

function epicMove(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted && r.id && (r.before_id || r.after_id);
    })
    .sort(sortBy(function(r) {
      return -1 * project.indexOfEpic(r.id);
    }))
    .forEach(function(r) {
      if (r.before_id) {
        project.moveEpicBefore(r.id, r.before_id);
      } else if (r.after_id) {
        project.moveEpicAfter(r.id, r.after_id);
      }
    });
  return project.data;
}

function sortBy(sorter) {
  return function(a, b) {
    var aVal = sorter(a);
    var bVal = sorter(b);

    if (aVal > bVal) {
      return 1;
    } else if (aVal < bVal) {
      return -1;
    } else {
      return 0;
    }
  }
}

module.exports = parse;
