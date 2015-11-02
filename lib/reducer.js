var assign = require('object-assign');
var Q = require('./q');
var R = require('ramda');

var compact = R.pickBy(
  R.compose(R.not, R.equals(null))
);

var versionLens  = R.lensProp('version');

var iterationOverrideLens = R.lensProp('iteration_overrides');

var labelsLens = R.lensProp('labels');

var storiesLens = R.lensProp('stories');

var epicsLens = R.lensProp('epics');

var labelLens = function(labelIndex) {
  return R.compose(
    labelsLens,
    R.lensIndex(labelIndex)
  );
}

var storyLens = function(storyIndex) {
  return R.compose(
    storiesLens,
    R.lensIndex(storyIndex)
  );
}

var storyTasksLens = function(storyIndex) {
  return R.compose(
    storyLens(storyIndex),
    R.lensProp('tasks')
  );
}

var storyTaskLens = function(storyIndex, taskIndex) {
  return R.compose(
    storyTasksLens(storyIndex),
    R.lensIndex(taskIndex)
  );
}

var storyCommentsLens = function(storyIndex) {
  return R.compose(
    storyLens(storyIndex),
    R.lensProp('comments')
  );
}

var storyCommentLens = function(storyIndex, commentIndex) {
  return R.compose(
    storyCommentsLens(storyIndex),
    R.lensIndex(commentIndex)
  );
}

var epicLens = function(epicIndex) {
  return R.compose(
    epicsLens,
    R.lensIndex(epicIndex)
  );
}

var epicCommentsLens = function(epicIndex) {
  return R.compose(
    epicLens(epicIndex),
    R.lensProp('comments')
  );
}

var epicCommentLens = function(epicIndex, commentIndex) {
  return R.compose(
    epicCommentsLens(epicIndex),
    R.lensIndex(commentIndex)
  );
}

var commentLens = function(state, commentId) {
  var q =  Q(state);
  if (q.isStoryComment(commentId)) {
    var path = q.pathOfStoryComment(commentId);
    return storyCommentLens(path[0], path[1]);
  } else {
    var path = q.pathOfEpicComment(commentId);
    return epicCommentLens(path[0], path[1]);
  }
}

var fileAttachmentsLens = function(state, commentId) {
  return R.compose(
    commentLens(state, commentId),
    R.lensProp('file_attachments')
  );
}

var googleAttachmentsLens = function(state, commentId) {
  return R.compose(
    commentLens(state, commentId),
    R.lensProp('google_attachments')
  );
}

function updateVersion(state, action) {
  return R.set(
    versionLens,
    action.version,
    state
  );
}

function deleteStory(state, action) {
  return R.over(
    storiesLens,
    R.remove(Q(state).indexOfStory(action.id), 1),
    state
  );
}

function createStory(state, action) {
  return R.over(
    storiesLens,
    R.append({id: action.id, comments: [], tasks: []}),
    state
  );
}

function updateStory(state, action) {
  var index = Q(state).indexOfStory(action.id);

  return R.over(
    storyLens(index),
    R.compose(compact, R.merge(R.__, action.attrs)),
    state
  );
}

function moveStory(state, action) {
  var index = Q(state).indexOfStory(action.id);
  var moveStory = state.stories[index];
  var stories = state.stories.slice();
  stories.splice(index, 1);

  var toIndex = -1;

  if (action.before_id) {
    toIndex = Q({stories: stories}).indexOfStory(action.before_id);
  } else if (action.after_id) {
    toIndex = Q({stories: stories}).indexOfStory(action.after_id) + 1;
  }

  stories.splice(toIndex, 0, moveStory);

  return assign({}, state, {stories: stories});
}

function deleteTask(state, action) {
  var path = Q(state).pathOfTask(action.id);

  return R.over(
    storyTasksLens(path[0]),
    R.remove(path[1], 1),
    state
  );
}

function createTask(state, action) {
  var storyIndex = Q(state).indexOfStory(action.storyId);

  return R.over(
    storyTasksLens(storyIndex),
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
    storyTaskLens(path[0], path[1]),
    R.compose(compact, R.merge(R.__, action.attrs)),
    state
  );
}

function deleteComment(state, action) {
  var q = Q(state);

  if (q.isStoryComment(action.id)) {
    var path = q.pathOfStoryComment(action.id);

    return R.over(
      storyCommentsLens(path[0]),
      R.remove(path[1], 1),
      state
    );
  } else {
    var path = q.pathOfEpicComment(action.id);

    return R.over(
      epicCommentsLens(path[0]),
      R.remove(path[1], 1),
      state
    );
  }
}

function deleteEpic(state, action) {
  return R.over(
    epicsLens,
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
    labelsLens,
    R.append({id: action.id}),
    state
  );
}

function updateLabel(state, action) {
  var labelIndex = Q(state).indexOfLabel(action.id);

  return R.over(
    labelLens(labelIndex),
    R.merge(R.__, action.attrs),
    state
  );
}

function deleteIterationOverride(state, action) {
  return R.over(
    iterationOverrideLens,
    R.remove(Q(state).indexOfIterationOverride(action.number), 1),
    state
  );
}

function createComment(state, action) {
  if (action.storyId) {
    var storyIndex = Q(state).indexOfStory(action.storyId);

    return R.over(
      storyCommentsLens(storyIndex),
      R.append({id: action.id, file_attachments: [], google_attachments: []}),
      state
    );
  } else {
    var epicIndex = Q(state).indexOfEpic(action.epicId);

    return R.over(
      epicCommentsLens(epicIndex),
      R.append({id: action.id, file_attachments: [], google_attachments: []}),
      state
    );
  }
}

function updateComment(state, action) {
  var attrs = action.attrs;
  // var faLens = fileAttachmentsLens(state, action.id);
  // var gaLens = googleAttachmentsLens(state, action.id);

  // var idProp = R.prop('id');

  // var originalObjs = R.reduce(function(memo, obj) {
  //   return R.assoc(idProp(obj), obj, memo);
  // }, {});

  // var originalFileAttachments = originalObjs(R.view(faLens, state));

  // console.log('originalFileAttachments', originalFileAttachments)
  // var originalGoogleAttachments = originalObjs(R.view(gaLens, state));

  var fileAttachments = R.map(function(id) {
    return R.defaultTo({id: id}, void 0);
    // var findById = R.find(R.propEq('id', id));
    // return R.defaultTo({id: id}, findById(originalFileAttachments));
  }, R.defaultTo([], attrs.file_attachment_ids));


  var googleAttachments = R.map(function(id) {
    return R.defaultTo({id: id}, void 0);
    // var findById = R.find(R.propEq('id', id));
    // return R.defaultTo({id: id}, findById(originalFileAttachments));
  }, R.defaultTo([], attrs.google_attachment_ids));

  // var attachments = R.merge(R.__, {
  //   // file_attachments: [],
  //   // google_attachments: []
  //   file_attachments: R.prop('file_attachment_ids'),
  //   google_attachments: R.prop('google_attachment_ids')
  // });

  var createAttachments = R.mapObjIndexed(function(val, key, obj) {
    if (key === 'file_attachments' && obj.file_attachment_ids) return fileAttachments;
    if (key === 'google_attachments' && obj.google_attachment_ids) return googleAttachments;
    return val;
  });

  var omitAttachmentIds = R.omit([
    'file_attachment_ids',
    'google_attachment_ids'
  ]);

  var mergeAttrs = R.merge(R.__);

  var lens = commentLens(state, action.id);

  var updateComment = R.compose(
    omitAttachmentIds,
    createAttachments,
    mergeAttrs
  );

  return R.over(
    lens,
    R.compose(compact, updateComment(action.attrs)),
    state
  );
}

function reducer(state, action) {
  // console.log('action', action);
  switch (action.type) {
    case reducer.UPDATE_VERSION:            return updateVersion(state, action);
    case reducer.DELETE_STORY:              return deleteStory(state, action);
    case reducer.CREATE_STORY:              return createStory(state, action);
    case reducer.UPDATE_STORY:              return updateStory(state, action);
    case reducer.MOVE_STORY:                return moveStory(state, action);
    case reducer.DELETE_TASK:               return deleteTask(state, action);
    case reducer.CREATE_TASK:               return createTask(state, action);
    case reducer.MOVE_TASK:                 return moveTask(state, action);
    case reducer.UPDATE_TASK:               return updateTask(state, action);
    case reducer.DELETE_COMMENT:            return deleteComment(state, action);
    case reducer.DELETE_EPIC:               return deleteEpic(state, action);
    case reducer.CREATE_EPIC:               return createEpic(state, action);
    case reducer.UPDATE_EPIC:               return updateEpic(state, action);
    case reducer.CREATE_LABEL:              return createLabel(state, action);
    case reducer.UPDATE_LABEL:              return updateLabel(state, action);
    case reducer.CREATE_COMMENT:            return createComment(state, action);
    case reducer.UPDATE_COMMENT:            return updateComment(state, action);
    case reducer.DELETE_ITERATION_OVERRIDE: return deleteIterationOverride(state, action);
    default:                                return state;
  }
}

reducer.UPDATE_VERSION            = {type: '***UPDATE_VERSION***'};
reducer.DELETE_STORY              = {type: '***DELETE_STORY***'};
reducer.CREATE_STORY              = {type: '***CREATE_STORY***'};
reducer.UPDATE_STORY              = {type: '***UPDATE_STORY***'};
reducer.MOVE_STORY                = {type: '***MOVE_STORY***'};
reducer.DELETE_TASK               = {type: '***DELETE_TASK***'};
reducer.CREATE_TASK               = {type: '***CREATE_TASK***'};
reducer.MOVE_TASK                 = {type: '***MOVE_TASK***'};
reducer.UPDATE_TASK               = {type: '***UPDATE_TASK***'};
reducer.DELETE_COMMENT            = {type: '***DELETE_COMMENT***'};
reducer.DELETE_EPIC               = {type: '***DELETE_EPIC***'};
reducer.CREATE_EPIC               = {type: '***CREATE_EPIC***'};
reducer.UPDATE_EPIC               = {type: '***UPDATE_EPIC***'};
reducer.CREATE_LABEL              = {type: '***CREATE_LABEL***'};
reducer.UPDATE_LABEL              = {type: '***UPDATE_LABEL***'};
reducer.CREATE_COMMENT            = {type: '***CREATE_COMMENT***'};
reducer.UPDATE_COMMENT            = {type: '***UPDATE_COMMENT***'};
reducer.DELETE_ITERATION_OVERRIDE = {type: '***DELETE_ITERATION_OVERRIDE***'};

module.exports = reducer;
