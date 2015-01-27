var _ = require('lodash');
var paths = require('./lib/paths');
var Project = require('./lib/project');

module.exports = patcher([
  commentDeletes,
  taskDeletes,
  storyDeletes,
  labelAttrs,
  storyAttrs,
  epicAttrs,
  taskAttrs,
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

        patch.push(
          {op: 'move', path: paths.story(newIndex), from: paths.story(index)}
        );
      }
      else if (result.before_id) {
        var beforeIndex = project.indexOfStoryById(result.before_id);

        patch.push(
          {op: 'move', path: path.story(beforeIndex), from: paths.story(index)}
        );
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

      if (!original && result.after_id) {
          var newIndex = project.indexOfStoryById(result.after_id) + 1;

          patch.push({
            op: 'add',
            path: paths.story(newIndex),
            value: _.defaults(_.pick(result, STORY_ATTRS), {comments: [], tasks: []})
          });
        return;
      }

      STORY_ATTRS
        .filter(_.partial(_.has, result))
        .forEach(function(attr) {
          var path = paths.storyAttr(index, attr);
          patch = patch.concat(setAttr(project, path, result[attr]))
        });
    });

  return patch;
}

function setAttr(project, path, value) {
  if (!project.has(path)) {
    return [{op: 'add', path: path, value: value}];
  }
  else if (_.isNull(value)) {
    return [{op: 'remove', path: path}];
  }
  else if (value !== project.get(path)) {
    return [{op: 'replace', path: path, value: value}];
  }
  return [];
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


function epicAttrs(project, command) {
  var patch = [];

  command.results
    .filter(typeEpic)
    .filter(notDeleted)
    .forEach(function(result) {
      var path = paths.epic(project.indexOfEpicById(result.id));
      var original = project.get(path);

      if (original) {
        [
          'id',
          'created_at',
          'updated_at',
          'name',
          'label_id',
          'follower_ids',
          'past_done_stories_count',
          'past_done_stories_no_point_count',
          'past_done_story_estimates'
        ].forEach(function(attr) {

          if (_.has(result, attr)) {
            if (_.has(original, attr)) {
              patch.push(
                {op: 'replace', path: path + '/' + attr, value: result[attr]}
              );
            }
          }

          // if (!original || !_.has(original, attr)) {
          // }
          // patch.push(
          //   {op: 'replace', path: paths.storyTask(storyIndex, newIndex), value: _.pick(result, TASK_ATTRS)}
          // );
        })
      }



    });

  return patch;
}

function commentAttrs(project, command) {
  var patch = [];

  command.results
    .filter(typeComment)
    .filter(notDeleted)
    .forEach(function(result) {

      // new story comment
      // new epic comment
      // new comment existing story
      // new comment existing epic
      // update comment existing story
      // update comment existing epic

      var commentPath;

      var storyIndex = project.indexOfStoryById(result.story_id);
      if (storyIndex !== -1) {
        commentPath = paths.storyComment(storyIndex, 0);
      }

      var epicIndex = project.indexOfEpicById(result.epic_id);
      if (epicIndex !== -1) {
        commentPath = paths.epicComment(epicIndex, 0);
      }

      var originalComment = project.get(commentPath);
      if (!originalComment) {
        var addOpValue = _.pick(result,
          'id',
          'text',
          'person_id',
          'created_at',
          'updated_at'
        );

        if (result.google_attachment_ids && result.google_attachment_ids.length) {
          addOpValue.google_attachments = [];

          result.google_attachment_ids.forEach(function(gaId) {
            var gaResult = _.where(command.results, {type: 'google_attachment', id: gaId})[0];

            addOpValue.google_attachments.push(_.pick(gaResult,
              'id',
              'google_kind',
              'person_id',
              'resource_id',
              'alternate_link',
              'google_id',
              'title'
            ));
          });
        }

        if (result.file_attachment_ids && result.file_attachment_ids.length) {
          addOpValue.file_attachments = [];

          result.file_attachment_ids.forEach(function(fileId) {
            var fileResult = _.where(command.results, {type: 'file_attachment', id: fileId})[0];

            addOpValue.file_attachments.push(_.pick(fileResult,
              'id',
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
            ));
          });
        }

        patch.push({
          op: 'add',
          path: commentPath,
          value: _.defaults(addOpValue, {
            google_attachments: [],
            file_attachments: []
          })
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

function typeEpic(result) {
  return result.type === 'epic';
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

function typeGoogleAttachment(result) {
  return result.type === 'google_attachment';
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
