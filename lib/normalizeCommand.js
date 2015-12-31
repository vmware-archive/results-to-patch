'use strict';
const commandTypes = require('./commandTypes');
const normalizeComment = require('./normalizeCommentResult');
const normalizeFollowing = require('./normalizeFollowingResult');
const normalizeGoogleAttachment = require('./normalizeGoogleAttachmentResult');
const normalizeStory = require('./normalizeStoryResult');
const normalizeEpic = require('./normalizeEpicResult');
const normalizeFileAttachment = require('./normalizeFileAttachmentResult');
const normalizeIteration = require('./normalizeIterationResult');
const normalizeLabel = require('./normalizeLabelResult');
const normalizeTask = require('./normalizeTaskResult');

function normalizeCommandType(type) {
  switch (type) {
    case 'comment_create': return commandTypes.RECEIVE_COMMENT_CREATE;
    case 'comment_delete': return commandTypes.RECEIVE_COMMENT_DELETE;
    case 'epic_create': return commandTypes.RECEIVE_EPIC_CREATE;
    case 'epic_delete': return commandTypes.RECEIVE_EPIC_DELETE;
    case 'epic_move': return commandTypes.RECEIVE_EPIC_MOVE;
    case 'epic_update': return commandTypes.RECEIVE_EPIC_UPDATE;
    case 'follower_create': return commandTypes.RECEIVE_FOLLOWER_CREATE;
    case 'follower_delete': return commandTypes.RECEIVE_FOLLOWER_DELETE;
    case 'iteration_update': return commandTypes.RECEIVE_ITERATION_UPDATE;
    case 'label_update': return commandTypes.RECEIVE_LABEL_UPDATE;
    case 'multi_label_create': return commandTypes.RECEIVE_MULTI_LABEL_CREATE;
    case 'multi_story_delete': return commandTypes.RECEIVE_MULTI_STORY_DELETE;
    case 'multi_story_move': return commandTypes.RECEIVE_MULTI_STORY_MOVE;
    case 'multi_story_move_from_project': return commandTypes.RECEIVE_MULTI_STORY_MOVE_FROM_PROJECT;
    case 'multi_story_move_into_project_and_prioritize': return commandTypes.RECEIVE_MULTI_STORY_MOVE_INTO_PROJECT_AND_PRIORITIZE;
    case 'multi_story_update_label': return commandTypes.RECEIVE_MULTI_STORY_UPDATE_LABEL;
    case 'story_create': return commandTypes.RECEIVE_STORY_CREATE;
    case 'story_update': return commandTypes.RECEIVE_STORY_UPDATE;
    case 'task_create': return commandTypes.RECEIVE_TASK_CREATE;
    case 'task_delete': return commandTypes.RECEIVE_TASK_DELETE;
    case 'task_update': return commandTypes.RECEIVE_TASK_UPDATE;
    default: throw new Error('unrecognized command type');
  }
}

function normalizeResult(result) {
  switch (result.type) {
    case 'comment': return normalizeComment(result);
    case 'following': return normalizeFollowing(result);
    case 'google_attachment': return normalizeGoogleAttachment(result);
    case 'story': return normalizeStory(result);
    case 'epic': return normalizeEpic(result);
    case 'file_attachment': return normalizeFileAttachment(result);
    case 'iteration': return normalizeIteration(result);
    case 'label': return normalizeLabel(result);
    case 'task': return normalizeTask(result);
    default: throw new Error('unrecognized result type');
  }
}

function compact(r) {
  return r.type;
}

function sortByType(lkp, r) {
  lkp[r.type] = lkp[r.type] || {};
  lkp[r.type][r.id] = r.attrs;
  return lkp;
}

module.exports = function(command) {
  return {
    type: normalizeCommandType(command.type),
    project: command.project.id,
    version: command.project.version,
    results: command.results.map(normalizeResult).filter(compact).reduce(sortByType, {}),
  };
};
