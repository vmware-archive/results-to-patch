var _ = require('lodash');
var paths = require('./lib/paths');
var Project = require('./lib/project');

module.exports = patcher([
  commentDeletes,
  taskDeletes,
  storyDeletes,
  taskAttrs,
  labelAttrs,
  storyAttrs,
  commentAttrs,
  storyMoves,
  projectVersion
]);

function projectVersion(project, command) {
  return [{
    op: 'replace',
    path: paths.version(),
    value: command.project.version
  }];
}

function storyMoves(project, command) {
  var patch = [];

  command.results
    .filter(typeStory)
    .forEach(function(result) {
      var index = project.indexOfStoryById(result.id);

      if (index === -1) {
        return;
      }

      if (result.after_id) {
        var newIndex = project.indexOfStoryById(result.after_id);
        if (newIndex < index) {
          newIndex += 1;
        }

        patch.push({
          op: 'move',
          path: paths.story(newIndex),
          from: paths.story(index)
        });
      }
      else if (result.before_id) {
        var beforeIndex = project.indexOfStoryById(result.before_id);

        patch.push({
          op: 'move',
          path: path.story(beforeIndex),
          from: paths.story(index)
        });
      }
    });

  return patch;
}

function storyDeletes(project, command) {
  var patch = [];

  command.results
    .filter(typeStory)
    .filter(isDeleted)
    .forEach(function(result) {
      patch.push(
        {op: 'remove', path: paths.story(project.indexOfStoryById(result.id))}
      );
    });

  return patch;
}

var STORY_ATTRS = [
  'id',
  'created_at',
  'updated_at',
  'accepted_at',
  'estimate',
  'story_type',
  'name',
  'description',
  'current_state',
  'requested_by_id',
  'owner_ids',
  'label_ids',
  'follower_ids',
  'owned_by_id',
  'tasks',
  'comments'
];

function storyAttrs(project, command) {
  var patch = [];

  command.results
    .filter(typeStory)
    .filter(notDeleted)
    .forEach(function(result) {
      var index = project.indexOfStoryById(result.id);
      var original = project.storyById(result.id);

      if (!original) {
        if (result.after_id) {
          var newIndex = project.indexOfStoryById(result.after_id) + 1;

          patch.push({
            op: 'add',
            path: paths.story(newIndex),
            value: _.defaults(_.pick(result, STORY_ATTRS), {comments: [], tasks: []})
          });
        }
        return;
      }

      STORY_ATTRS.forEach(function(attr) {
        if (_.has(result, attr)) {
          if (!original || !_.has(original, attr)) {
            patch.push(
              {op: 'add', path: paths.storyAttr(index, attr), value: result[attr]}
            );
          }
          else if (_.isNull(result[attr])) {
            patch.push(
              {op: 'remove', path: paths.storyAttr(index, attr)}
            );
          }
          else if (result[attr] !== original[attr]) {
            patch.push(
              {op: 'replace', path: paths.storyAttr(index, attr), value: result[attr]}
            );
          }
        }
      });
    });

  return patch;
}

function labelAttrs(project, command) {
  var patch = [];

  command.results
    .filter(typeLabel)
    .filter(notDeleted)
    .forEach(function(result) {
      var newIndex = _.sortedIndex(project.labelNames(), result.name);

      patch.push(
        {op: 'add', path: paths.label(newIndex), value: _.pick(result, 'id', 'name', 'created_at', 'updated_at')}
      );
    });

  return patch;
}

var TASK_ATTRS = [
  'id',
  'description',
  'complete',
  'created_at',
  'updated_at'
];

function taskAttrs(project, command) {
  var patch = [];

  command.results
    .filter(typeTask)
    .filter(notDeleted)
    .forEach(function(result) {
      var newIndex = result.position - 1;
      var storyIndex = project.indexOfStoryById(result.story_id);

      patch.push(
        {op: 'add', path: paths.storyTask(storyIndex, newIndex), value: _.pick(result, TASK_ATTRS)}
      );
    });

  return patch;
}

function taskDeletes(project, command) {
  var patch = [];

  command.results
    .filter(typeTask)
    .filter(isDeleted)
    .forEach(function(result) {
      var path = paths.storyTask.apply(paths, project.indexOfStoryTaskById(result.id));

      patch.push(
        {op: 'remove', path: path}
      );
    });

  return patch;
}

function commentAttrs(project, command) {
  var patch = [];

  command.results
    .filter(typeComment)
    .filter(notDeleted)
    .forEach(function(result) {
      var storyIndex = project.indexOfStoryById(result.story_id);
      var story = project.storyById(result.story_id);
      var commentIndex = 0;
      var commentPath = paths.storyComment(storyIndex, commentIndex);
      var originalComment = story.comments[commentIndex];

      if (!originalComment) {
        patch.push({
          op: 'add', path: commentPath,
          value: _.pick(result,
            'id',
            'text',
            'person_id',
            'created_at',
            'updated_at',
            'file_attachments',
            'google_attachments'
          )
        });
      }
    });

  return patch;
}

function commentDeletes(project, command) {
  var patch = [];

  command.results
    .filter(typeComment)
    .filter(isDeleted)
    .forEach(function(result) {
      var path = paths.storyComment.apply(paths, project.indexOfStoryCommentById(result.id));

      patch.push(
        {op: 'remove', path: path}
      );
    });

  return patch;
}

function typeStory(result) {
  return result.type === 'story';
}

function typeComment(result) {
  return result.type === 'comment';
}

function typeLabel(result) {
  return result.type === 'label';
}

function typeTask(result) {
  return result.type === 'task';
}

function isDeleted(result) {
  return result.deleted === true;
}

function notDeleted(result) {
  return !result.deleted;
}

function patcher(patchers) {
  return function(projectJSON, command) {
    var project = new Project(projectJSON);

    return patchers.reduce(function(patch, patcher) {
      return patch.concat(patcher(project, command));
    }, []);
  }
}
