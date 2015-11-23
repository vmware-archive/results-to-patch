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

function update(state, id, attrs, defaults) {
  // var R = require('ramda');
  // return R.over(
  //   R.lensProp(id),
  //   R.merge(R.__, R.merge(defaults || {}, attrs)),
  //   state
  // );
}

// function project(state, action) {
//   return state;
// }

function projects(state, action) {
  switch (action.type) {
    case UPDATE_PROJECT:

      return update(state, action.projectId, action.attrs);
    case UPDATE_ITERATION_OVERRIDE:
      // console.log(state)
      // return project(state[action.projectId], action);
    default:
      return state;
  }
  // return update(state, action.id, action.attrs);
  // return update(state, action.id, {iteration_overrides: state[]});
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

function iterationOverrides(state, action) {
  switch (action.type) {
    case UPDATE_ITERATION_OVERRIDE: return update(state, action.number, action.attrs, {number: action.number, team_strength: 1});
    default:                        return state;
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
