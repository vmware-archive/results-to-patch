var assign = require('object-assign');
var redux = require('redux');
var R = require('ramda');
var lens = require('./lens');
var constants = require('./constants');
var utils = require('./utils');

function updateProject(state, action) {
  return R.over(
    lens.project(action.id),
    R.merge(R.__, action.attrs),
    state
  );
}

function deleteStory(state, action) {
  return R.over(
    lens.storiesLens,
    R.remove(Q(state).indexOfStory(action.id), 1),
    state
  );
}

function createStory(state, action) {
  return R.over(
    lens.storiesLens,
    R.append({id: action.id, comments: [], tasks: []}),
    state
  );
}

function updateStory(state, action) {
  var index = Q(state).indexOfStory(action.id);

  return R.over(
    lens.storyLens(index),
    R.compose(utils.compactObj, R.merge(R.__, action.attrs)),
    state
  );
}

function moveStories(state, action) {
  var indexOf = state.stories.reduce(utils.getIndexLkp, {});
  var isActionId = action.storyIds.reduce(utils.getContainsLkp, {});

  var newIndex = action.afterId ? indexOf[action.afterId] + .5 :
                  action.beforeId ? indexOf[action.beforeId] - .5 :
                  indexOf[R.head(action.storyIds)];

  var sorter = function(storyToSort) {
    if (isActionId[storyToSort.id]) {
      return newIndex + (indexOf[storyToSort.id] / (10 * state.stories.length));
    } else {
      return indexOf[storyToSort.id];
    }
  };

  return R.over(
    lens.storiesLens,
    R.sortBy(sorter),
    state
  );
}

function deleteTask(state, action) {
  var path = Q(state).pathOfTask(action.id);

  return R.over(
    lens.storyTasksLens(path[0]),
    R.remove(path[1], 1),
    state
  );
}

function createTask(state, action) {
  var storyIndex = Q(state).indexOfStory(action.storyId);

  return R.over(
    lens.storyTasksLens(storyIndex),
    R.append({id: action.id}),
    state
  );
}

function moveTask(state, action) {
  var path = Q(state).pathOfTask(action.id);

  return assign({}, state, {
    stories: state.stories.map(function(story, storyIndex) {
      if (storyIndex !== path[0]) return story;

      var tasks = story.tasks.slice();
      var task = tasks[path[1]];
      tasks.splice(path[1], 1);
      tasks.splice(action.position - 1, 0, task);

      return assign({}, story, {
        tasks: tasks
      });
    })
  });
}

function updateTask(state, action) {
  var path = Q(state).pathOfTask(action.id);

  return R.over(
    lens.storyTaskLens(path[0], path[1]),
    R.compose(utils.compactObj, R.merge(R.__, action.attrs)),
    state
  );
}

function deleteComment(state, action) {
  var q = Q(state);

  if (q.isStoryComment(action.id)) {
    var path = q.pathOfStoryComment(action.id);

    return R.over(
      lens.storyCommentsLens(path[0]),
      R.remove(path[1], 1),
      state
    );
  } else {
    var path = q.pathOfEpicComment(action.id);

    return R.over(
      lens.epicCommentsLens(path[0]),
      R.remove(path[1], 1),
      state
    );
  }
}

function deleteEpic(state, action) {
  return R.over(
    lens.epicsLens,
    R.remove(Q(state).indexOfEpic(action.id), 1),
    state
  );
}

function createEpic(state, action) {
  return assign({}, state, {
    epics: state.epics.concat({id: action.id, comments: []})
  });
}

function updateEpic(state, action) {
  return assign({}, state, {
    epics: state.epics.map(function(epic) {
      if (epic.id === action.id) {
        return assign({}, epic, action.attrs);
      }
      return epic;
    })
  });
}

function createLabel(state, action) {
  return R.over(
    lens.labelsLens,
    R.append({id: action.id}),
    state
  );
}

function updateLabel(state, action) {
  var labelIndex = Q(state).indexOfLabel(action.id);

  return R.over(
    lens.labelLens(labelIndex),
    R.merge(R.__, action.attrs),
    state
  );
}

function updateIterationOverride(state, action) {
  return R.assocPath(
    ['iterationOverrides', action.number],
    action.attrs,
    state
  );
  // return R.over(
  //   lens.iterationOverride(action.number),
  //   R.merge(R.__, action.attrs),
  //   state
  // );

  // if (iterationOverrideIndex !== -1) {
  // } else {
    // return R.over(
    //   lens.iterationOverridesLens,
    //   R.pipe(
    //     R.append(R.merge({number: action.number, team_strength: 1}, action.attrs)),
    //     R.sortBy(R.prop('number'))
    //   ),
    //   state
    // );
  // }
}

function deleteIterationOverride(state, action) {
  return R.over(
    lens.iterationOverridesLens,
    R.remove(Q(state).indexOfIterationOverride(action.number), 1),
    state
  );
}

function createComment(state, action) {
  if (action.storyId) {
    var storyIndex = Q(state).indexOfStory(action.storyId);

    return R.over(
      lens.storyCommentsLens(storyIndex),
      R.append({id: action.id, file_attachments: [], google_attachments: []}),
      state
    );
  } else {
    var epicIndex = Q(state).indexOfEpic(action.epicId);

    return R.over(
      lens.epicCommentsLens(epicIndex),
      R.append({id: action.id, file_attachments: [], google_attachments: []}),
      state
    );
  }
}

function updateComment(state, action) {
  var attrs = action.attrs;

  var fileAttachments = R.map(function(id) {
    return R.defaultTo({id: id}, void 0);
  }, R.defaultTo([], attrs.file_attachment_ids));

  var googleAttachments = R.map(function(id) {
    return R.defaultTo({id: id}, void 0);
  }, R.defaultTo([], attrs.google_attachment_ids));

  var createAttachments = R.mapObjIndexed(function(val, key, obj) {
    if (key === 'file_attachments' && obj.file_attachment_ids) return fileAttachments;
    if (key === 'google_attachments' && obj.google_attachment_ids) return googleAttachments;
    return val;
  });

  var omitAttachmentIds = R.omit([
    'file_attachment_ids',
    'google_attachment_ids'
  ]);

  var updater = R.compose(
    omitAttachmentIds,
    createAttachments,
    R.merge(R.__, action.attrs)
  );

  return R.over(
    lens.commentLens(state, action.id),
    R.compose(utils.compactObj, updater),
    state
  );
}

function updateFileAttachment(state, action) {

}

function reducer(state, action) {
  console.log('action', action);

  switch (action.type) {
    case constants.UPDATE_PROJECT:            return updateProject(state, action);
    // case constants.DELETE_STORY:              return deleteStory(state, action);
    // case constants.CREATE_STORY:              return createStory(state, action);
    // case constants.UPDATE_STORY:              return updateStory(state, action);
    // case constants.MOVE_STORIES:              return moveStories(state, action);
    // case constants.DELETE_TASK:               return deleteTask(state, action);
    // case constants.CREATE_TASK:               return createTask(state, action);
    // case constants.MOVE_TASK:                 return moveTask(state, action);
    // case constants.UPDATE_TASK:               return updateTask(state, action);
    // case constants.DELETE_COMMENT:            return deleteComment(state, action);
    // case constants.DELETE_EPIC:               return deleteEpic(state, action);
    // case constants.CREATE_EPIC:               return createEpic(state, action);
    // case constants.UPDATE_EPIC:               return updateEpic(state, action);
    // case constants.CREATE_LABEL:              return createLabel(state, action);
    // case constants.UPDATE_LABEL:              return updateLabel(state, action);
    // case constants.CREATE_COMMENT:            return createComment(state, action);
    // case constants.UPDATE_COMMENT:            return updateComment(state, action);
    // case constants.DELETE_ITERATION_OVERRIDE: return deleteIterationOverride(state, action);
    case constants.UPDATE_ITERATION_OVERRIDE: return updateIterationOverride(state, action);
    // case constants.UPDATE_FILE_ATTACHMENT:    return updateFileAttachment(state, action);
    default:                                  return state;
  }
}

module.exports = reducer;
