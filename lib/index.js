var Project = require('./project');
var assign = require('object-assign');
var reducer = require('./reducer');
var Q = require('./q');
var R = require('ramda');

function deleteStoryFilter(r) {
  return r.type === 'story' && (r.deleted || r.moved);
}

function deleteStory(state, r) {
  return R.assoc(
    'stories',
    R.reject(R.whereEq({id: r.id}), state.stories),
    state
  );
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

function updateStory(state, r) {
  var attrs = R.compose(
    R.pick([
      'created_at',
      'updated_at',
      'accepted_at',
      'integration_id',
      'deadline',
      'story_type',
      'name',
      'description',
      'current_state',
      'requested_by_id',
      'owner_ids',
      'label_ids',
      'follower_ids',
      'owned_by_id',
      'estimate',
      'external_id',
    ]),
    R.evolve({
      estimate:    R.ifElse(R.equals(-1), R.always(null), R.identity),
      external_id: R.ifElse(R.equals(''), R.always(null), R.identity),
    })
  )(r);

  var mergeAttrs = R.merge(R.__, attrs);

  var keysToOmit = R.keys(
    R.pickBy(R.equals(null), attrs)
  );

  var omitNulls = R.omit(keysToOmit);

  var storyIndex = Q(state).indexOfStory(r.id);

  var storiesLens = R.lensProp('stories');

  var updatedStories = R.adjust(
    R.compose(omitNulls, mergeAttrs),
    storyIndex,
    R.view(storiesLens, state)
  );

  return R.set(
    storiesLens,
    updatedStories,
    state
  );
}

function deleteTaskFilter(r) {
  return r.type === 'task' && r.deleted;
}

function deleteTask(state, r) {
  var path = Q(state).pathOfTask(r.id);

  var tasksLens = R.compose(
    R.lensProp('stories'),
    R.lensIndex(path[0]),
    R.lensProp('tasks')
  );

  var updatedTasks = R.remove(path[1], 1, R.view(tasksLens, state));

  return R.set(tasksLens, updatedTasks, state);
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
  if (r.hasOwnProperty('complete')) attrs.complete       = r.complete;
  if (r.hasOwnProperty('created_at')) attrs.created_at   = r.created_at;
  if (r.hasOwnProperty('updated_at')) attrs.updated_at   = r.updated_at;
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

function parse(state, command) {
  var results = command.results;
  var version = command.project.version;

  state = [].concat(
    {type: reducer.UPDATE_VERSION, version: version},
    commentDelete(state, command),
    // results.filter(deleteTaskFilter ).map(deleteTask ),
    results.filter(deleteEpicFilter ).map(deleteEpicAction ),
    results.filter(createStoryFilter).map(createStoryAction),
    results.filter(createTaskFilter ).map(createTaskAction ),
    results.filter(moveTaskFilter   ).map(moveTaskAction   ),
    results.filter(updateTaskFilter ).map(updateTaskAction ),
    results.filter(createEpicFilter ).map(createEpicAction ),
    results.filter(updateEpicFilter ).map(updateEpicAction ),
    results.filter(createLabelFilter).map(createLabelAction),
    results.filter(updateLabelFilter).map(updateLabelAction),
    results.filter(deleteIterationOverrideFilter).map(deleteIterationOverrideAction)
  ).reduce(reducer, state);

  state = results.filter(deleteTaskFilter ).reduce(deleteTask,  state);
  state = results.filter(deleteStoryFilter).reduce(deleteStory, state);
  state = results.filter(updateStoryFilter).reduce(updateStory, state);

  state = commentCreate(state, command);
  state = commentAttr(state, command);
  state = fileAttachmentAttr(state, command);
  state = googleAttachmentAttr(state, command);
  state = iterationOverrideCreate(state, command);
  state = iterationOverrideAttr(state, command);

  state = [].concat(
    storyMove(state, command)
  ).reduce(reducer, state);
  state = epicMove(state, command);
  state = labelMove(state, command);

  return state;
};

function storyMove(state, command) {
  var q = Q(state);

  return command.results
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved);
    })
    .map(function(r) {
      var index = q.indexOfStory(r.id);

      return {
        type: reducer.MOVE_STORY,
        id: r.id,
        index: index,
        after_id: r.hasOwnProperty('after_id') ? r.after_id : q.storyAtIndex(index - 1),
        before_id: r.hasOwnProperty('before_id') ? r.before_id : q.storyAtIndex(index + 1),
      };
    })
    .sort(sortBy(function(r) {
      return -1 * r.index;
    }))
}

function commentDelete(state, command) {
  var q = Q(state);

  return command.results
    .filter(function(r) {
      return r.type === 'comment' && r.deleted;
    })
    .map(function(r) {
      if (q.pathOfStoryComment(r.id)) {
        return {type: reducer.DELETE_STORY_COMMENT, id: r.id};
      }
      return {type: reducer.DELETE_EPIC_COMMENT, id: r.id};
    })
};

function commentCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'comment' && (r.story_id || r.epic_id) && !r.deleted;
    })
    .forEach(function(r) {
      if (r.story_id) {
        project.appendComment(project.pathOfStory(r.story_id), r.id);
      } else if (r.epic_id) {
        project.appendComment(project.pathOfEpic(r.epic_id), r.id);
      }
    });
  return project.data;
};

function commentAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'comment' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'text',
        'person_id',
        'created_at',
        'updated_at'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setCommentAttr(r.id, attr, r[attr]);
      });

      r.file_attachment_ids.forEach(function(faId, index) {
        if (!project.hasCommentFileAttachment(r.id, faId)) {
          project.appendCommentFileAttachment(r.id, faId, index);
        }
      });

      r.google_attachment_ids.forEach(function(gaId, index) {
        if (!project.hasGoogleAttachment(r.id, gaId)) {
          project.appendGoogleAttachment(r.id, gaId, index);
        }
      });
    });
  return project.data;
}

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

function iterationOverrideCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length !== 'default' && !project.hasIterationOverride(r.number);
    })
    .forEach(function(r) {
      project.insertIterationOverride(r.number);
    });
  return project.data;
}

function iterationOverrideAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length !== 'default';
    })
    .forEach(function(r) {
      [
        'length',
        'team_strength'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setIterationOverrideAttr(r.number, attr, r[attr]);
      });
    })
  return project.data;
}

function deleteIterationOverrideFilter(r) {
  return r.type === 'iteration' && r.length === 'default';
}

function deleteIterationOverrideAction(r) {
  return {type: reducer.DELETE_ITERATION_OVERRIDE, number: r.number};
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
