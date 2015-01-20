var _ = require('lodash');
var paths = require('./lib/paths');
var Project = require('./lib/project');

module.exports = patcher([
  commentDeletes,
  storyDeletes,
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
    .filter(isStory)
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
    .filter(isStory)
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
    .filter(isStory)
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

function commentAttrs(project, command) {
  var patch = [];

  command.results
    .filter(isComment)
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
    .filter(isComment)
    .filter(isDeleted)
    .forEach(function(result) {
      var path = paths.storyComment.apply(paths, project.indexOfStoryCommentById(result.id));

      patch.push(
        {op: 'remove', path: path}
      );
    });

  return patch;
}

function isStory(result) {
  return result.type === 'story';
}

function isComment(result) {
  return result.type === 'comment';
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
