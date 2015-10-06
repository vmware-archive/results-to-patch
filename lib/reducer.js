var assign = require('object-assign');
var Q = require('./q');

function compact(obj) {
  for (var key in obj) {
    if (obj[key] === null) {
      delete obj[key];
    }
  }
  return obj;
}

function updateVersion(state, action) {
  return assign({}, state, {
    version: action.version
  });
}

function deleteStory(state, action) {
  var index = Q(state).indexOfStory(action.id);
  var stories = state.stories.slice();
  stories.splice(index, 1);

  return assign({}, state, {
    stories: stories
  });
}

function createStory(state, action) {
  return assign({}, state, {
    stories: state.stories.concat({id: action.id, comments: [], tasks: []})
  });
}

function updateStory(state, action) {
  var stories = state.stories.map(function(story) {
    if (story.id !== action.id) return story;

    var updated = assign({}, story);

    for (var key in action) {
      switch (key) {
        case 'created_at':
        case 'updated_at':
        case 'accepted_at':
        case 'integration_id':
        case 'deadline':
        case 'story_type':
        case 'name':
        case 'description':
        case 'current_state':
        case 'requested_by_id':
        case 'owner_ids':
        case 'label_ids':
        case 'follower_ids':
        case 'owned_by_id':
          updated[key] = action[key];
          break;
        case 'estimate':
          updated[key] = action.estimate !== -1 ? action.estimate : null;
          break;
        case 'external_id':
          updated[key] = action.external_id !== '' ? action.external_id : null;
          break;
        default:
          break;
      }
    }

    return compact(updated);
  });

  return assign({}, state, {stories: stories});
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

  return assign({}, state, {
    stories: state.stories.map(function(story, storyIndex) {
      if (storyIndex !== path[0]) return story;

      return assign({}, story, {
        tasks: story.tasks.filter(function(task) { return task.id !== action.id; })
      });
    })
  });
}

function createTask(state, action) {
  return assign({}, state, {
    stories: state.stories.map(function(story) {
      if (story.id !== action.storyId) return story;

      return assign({}, story, {
        tasks: story.tasks.concat({id: action.id})
      });
    })
  });
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

  return assign({}, state, {
    stories: state.stories.map(function(story, storyIndex) {
      if (storyIndex !== path[0]) return story;

      return assign({}, story, {
        tasks: story.tasks.map(function(task, taskIndex) {
          if (taskIndex !== path[1]) return task;

          var attrs = {};
          if (action.hasOwnProperty('description')) attrs.description = action.description;
          if (action.hasOwnProperty('complete')) attrs.complete       = action.complete;
          if (action.hasOwnProperty('created_at')) attrs.created_at   = action.created_at;
          if (action.hasOwnProperty('updated_at')) attrs.updated_at   = action.updated_at;

          return assign({}, task, attrs);
        })
      });
    })
  });
}

function deleteStoryComment(state, action) {
  var path = Q(state).pathOfStoryComment(action.id);

  return assign({}, state, {
    stories: state.stories.map(function(story, storyIndex) {
      if (storyIndex !== path[0]) return story;

      return assign({}, story, {
        comments: story.comments.filter(function(comment) { return comment.id !== action.id; })
      });
    })
  });
}

function deleteEpicComment(state, action) {
  var path = Q(state).pathOfEpicComment(action.id);

  return assign({}, state, {
    epics: state.epics.map(function(epic, epicIndex) {
      if (epicIndex !== path[0]) return epic;

      return assign({}, epic, {
        comments: epic.comments.filter(function(comment) { return comment.id !== action.id; })
      });
    })
  });
}

function deleteEpic(state, action) {
  return assign({}, state, {
    epics: state.epics.filter(function(epic) { return epic.id !== action.id; })
  });
}

function reducer(state, action) {
  // console.log('action', action);
  switch (action.type) {
    case reducer.UPDATE_VERSION:        return updateVersion(state, action);
    case reducer.DELETE_STORY:          return deleteStory(state, action);
    case reducer.CREATE_STORY:          return createStory(state, action);
    case reducer.UPDATE_STORY:          return updateStory(state, action);
    case reducer.MOVE_STORY:            return moveStory(state, action);
    case reducer.DELETE_TASK:           return deleteTask(state, action);
    case reducer.CREATE_TASK:           return createTask(state, action);
    case reducer.MOVE_TASK:             return moveTask(state, action);
    case reducer.UPDATE_TASK:           return updateTask(state, action);
    case reducer.DELETE_STORY_COMMENT:  return deleteStoryComment(state, action);
    case reducer.DELETE_EPIC_COMMENT:   return deleteEpicComment(state, action);
    case reducer.DELETE_EPIC:           return deleteEpic(state, action);
    default:                            return state;
  }
}

reducer.UPDATE_VERSION        = {type: '***UPDATE_VERSION***'};
reducer.DELETE_STORY          = {type: '***DELETE_STORY***'};
reducer.CREATE_STORY          = {type: '***CREATE_STORY***'};
reducer.UPDATE_STORY          = {type: '***UPDATE_STORY***'};
reducer.MOVE_STORY            = {type: '***MOVE_STORY***'};
reducer.DELETE_TASK           = {type: '***DELETE_TASK***'};
reducer.CREATE_TASK           = {type: '***CREATE_TASK***'};
reducer.MOVE_TASK             = {type: '***MOVE_TASK***'};
reducer.UPDATE_TASK           = {type: '***UPDATE_TASK***'};
reducer.DELETE_STORY_COMMENT  = {type: '***DELETE_STORY_COMMENT***'};
reducer.DELETE_EPIC_COMMENT   = {type: '***DELETE_EPIC_COMMENT***'};
reducer.DELETE_EPIC           = {type: '***DELETE_EPIC***'};

module.exports = reducer;
