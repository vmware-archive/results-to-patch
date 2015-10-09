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
  return assign({}, state, {
    stories: state.stories.map(function(story) {
      if (story.id === action.id) {
        return compact(assign({}, story, action.attrs));
      }
      return story;
    })
  });
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
      if (storyIndex === path[0]) {
        return assign({}, story, {
          tasks: story.tasks.map(function(task, taskIndex) {
            if (taskIndex === path[1]) {
              return assign({}, task, action.attrs);
            }
            return task;
          })
        });
      }
      return story;
    })
  });
}

function deleteStoryComment(state, action) {
  var path = Q(state).pathOfStoryComment(action.id);

  return assign({}, state, {
    stories: state.stories.map(function(story, storyIndex) {
      if (storyIndex === path[0]) {
        return assign({}, story, {
          comments: story.comments.filter(function(comment) { return comment.id !== action.id; })
        });
      }
      return story;
    })
  });
}

function deleteEpicComment(state, action) {
  var path = Q(state).pathOfEpicComment(action.id);

  return assign({}, state, {
    epics: state.epics.map(function(epic, epicIndex) {
      if (epicIndex === path[0]) {
        return assign({}, epic, {
          comments: epic.comments.filter(function(comment) { return comment.id !== action.id; })
        });
      }
      return epic;
    })
  });
}

function deleteEpic(state, action) {
  return assign({}, state, {
    epics: state.epics.filter(function(epic) { return epic.id !== action.id; })
  });
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
  return assign({}, state, {
    labels: state.labels.concat({id: action.id})
  });
}

function updateLabel(state, action) {
  return assign({}, state, {
    labels: state.labels.map(function(label) {
      if (label.id === action.id) {
        return assign({}, label, action.attrs);
      }
      return label;
    })
  });
}

function deleteIterationOverride(state, action) {
  return assign({}, state, {
    iteration_overrides: state.iteration_overrides.filter(function(iteration) { return iteration.number !== action.number; })
  });
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
    case reducer.DELETE_STORY_COMMENT:      return deleteStoryComment(state, action);
    case reducer.DELETE_EPIC_COMMENT:       return deleteEpicComment(state, action);
    case reducer.DELETE_EPIC:               return deleteEpic(state, action);
    case reducer.CREATE_EPIC:               return createEpic(state, action);
    case reducer.UPDATE_EPIC:               return updateEpic(state, action);
    case reducer.CREATE_LABEL:              return createLabel(state, action);
    case reducer.UPDATE_LABEL:              return updateLabel(state, action);
    case reducer.DELETE_ITERATION_OVERRIDE: return deleteIterationOverride(state, action);
    default:                            return state;
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
reducer.DELETE_STORY_COMMENT      = {type: '***DELETE_STORY_COMMENT***'};
reducer.DELETE_EPIC_COMMENT       = {type: '***DELETE_EPIC_COMMENT***'};
reducer.DELETE_EPIC               = {type: '***DELETE_EPIC***'};
reducer.CREATE_EPIC               = {type: '***CREATE_EPIC***'};
reducer.UPDATE_EPIC               = {type: '***UPDATE_EPIC***'};
reducer.CREATE_LABEL              = {type: '***CREATE_LABEL***'};
reducer.UPDATE_LABEL              = {type: '***UPDATE_LABEL***'};
reducer.DELETE_ITERATION_OVERRIDE = {type: '***DELETE_ITERATION_OVERRIDE***'};

module.exports = reducer;
