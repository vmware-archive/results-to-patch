var constants                 = require('./constants');
var UPDATE_PROJECT            = constants.UPDATE_PROJECT;
var DELETE_STORY              = constants.DELETE_STORY;
var CREATE_STORY              = constants.CREATE_STORY;
var UPDATE_STORY              = constants.UPDATE_STORY;
var MOVE_STORIES              = constants.MOVE_STORIES;
var DELETE_TASK               = constants.DELETE_TASK;
var CREATE_TASK               = constants.CREATE_TASK;
var MOVE_TASK                 = constants.MOVE_TASK;
var UPDATE_TASK               = constants.UPDATE_TASK;
var DELETE_COMMENT            = constants.DELETE_COMMENT;
var DELETE_EPIC               = constants.DELETE_EPIC;
var CREATE_EPIC               = constants.CREATE_EPIC;
var UPDATE_EPIC               = constants.UPDATE_EPIC;
var CREATE_LABEL              = constants.CREATE_LABEL;
var UPDATE_LABEL              = constants.UPDATE_LABEL;
var CREATE_COMMENT            = constants.CREATE_COMMENT;
var UPDATE_COMMENT            = constants.UPDATE_COMMENT;
var UPDATE_ITERATION_OVERRIDE = constants.UPDATE_ITERATION_OVERRIDE;
var DELETE_ITERATION_OVERRIDE = constants.DELETE_ITERATION_OVERRIDE;
var UPDATE_FILE_ATTACHMENT    = constants.UPDATE_FILE_ATTACHMENT;

function projectIterationOverrides(state, action) {
  return state.concat(action.number);
}

function project(state, action) {
  switch (action.type) {
    case UPDATE_PROJECT:
      return {
        ...state,
        ...action.attrs,
      };

    case UPDATE_ITERATION_OVERRIDE:
      return {
        ...state,
        iteration_overrides: projectIterationOverrides(state.iteration_overrides || [], action),
      };

    default:
      return state;
  }
}

function projects(state, action) {
  switch (action.type) {
    case UPDATE_PROJECT:
    case UPDATE_ITERATION_OVERRIDE:
      return {
        ...state,
        [action.projectId]: project(state[action.projectId] || {}, action),
      };

    default:
      return state;
  }
}

function stories(state, action) {
  return state;
}

function epics(state, action) {
  return state;
}

function labels(state, action) {
  return state;
}

function integrations(state, action) {
  return state;
}

function iterationOverride(state, action) {
  return {
    number: action.number,
    team_strength: 1,
    ...state,
    ...action.attrs,
  }
}

function iterationOverrides(state, action) {
  switch (action.type) {
    case UPDATE_ITERATION_OVERRIDE:
      return {
        ...state,
        [action.number]: iterationOverride(state[action.number] || {}, action),
      };

    default:
      return state;
  }
}

function memberships(state, action) {
  return state;
}

function people(state, action) {
  return state;
}

function tasks(state, action) {
  return state;
}

function comments(state, action) {
  return state;
}

function fileAttachments(state, action) {
  return state;
}

function googleAttachments(state, action) {
  return state;
}

function reducer(state, action) {
  console.log('action', action)
  return {
    projects:           projects(state.projects, action),
    stories:            stories(state.stories, action),
    epics:              epics(state.epics, action),
    labels:             labels(state.labels, action),
    integrations:       integrations(state.integrations, action),
    iterationOverrides: iterationOverrides(state.iterationOverrides, action),
    memberships:        memberships(state.memberships, action),
    people:             people(state.people, action),
    tasks:              tasks(state.tasks, action),
    comments:           comments(state.comments, action),
    fileAttachments:    fileAttachments(state.fileAttachments, action),
    googleAttachments:  googleAttachments(state.googleAttachments, action),
  };
}

module.exports = reducer;
