var _ = require('lodash');

module.exports = patcher([
  // {filter: [isComment, isDelete], handler: deleteComment}
  commentDeletes,
  storyDeletes,
  storyAttrs,
  commentAttrs,
  storyMoves,
  projectVersion
]);

var paths = {
  version: function() {
    return '/version'
  },
  story: function(storyIndex) {
    return '/stories/' + storyIndex;
  },
  storyAttr: function(storyIndex, attr) {
    return '/stories/' + storyIndex + '/' + attr;
  },
  storyComment: function(storyIndex, commentIndex) {
    return '/stories/' + storyIndex + '/comments/' + commentIndex;
  }
}

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
      var index = indexOfStory(project, result.id);

      if (index === -1) {
        return;
      }

      if (result.after_id) {
        var newIndex = indexOfStory(project, result.after_id);
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
        var beforeIndex = indexOfStory(project, result.before_id);

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
        {op: 'remove', path: paths.story(indexOfStory(project, result.id))}
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

// function simpleAttr(findStoryAttrPath, '')

function storyAttrs(project, command) {
  var patch = [];

  command.results
    .filter(isStory)
    .filter(notDeleted)
    .forEach(function(result) {
      var index = indexOfStory(project, result.id);
      var original = project.stories[index];

      if (!original) {
        if (result.after_id) {
          var newIndex = indexOfStory(project, result.after_id) + 1;

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
      var storyIndex = indexOfStory(project, result.story_id);
      var story = project.stories[storyIndex];
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
      patch.push({
        op: 'remove',
        path: commentPathById(project, result.id)
      });
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
  return function(project, command) {
    return patchers.reduce(function(patch, patcher) {
      return patch.concat(patcher(project, command));
    }, []);
  }
}

function indexOfStory(project, id) {
  var stories = project.stories;
  var storiesLen = stories.length;

  for (var i = 0; i < storiesLen; i++) {
    if (stories[i].id === id) {
      return i;
    }
  }
  return -1;
};

function indexOfComment(story, id) {
  var comments = story.comments;
  var commentsLen = comments.length;

  for (var i = 0; i < commentsLen; i++) {
    if (comments[i].id === id) {
      return i;
    }
  }
  return -1;
}

function commentPathById(project, id) {
  var stories = project.stories;
  for (var i = 0; i < stories.length; i++) {
    var comments = stories[i].comments;
    for (var j = 0; j < comments.length; j++) {
      if (comments[j] && comments[j].id === id) {
        return paths.storyComment(i, j);
      }
    }
  }
}