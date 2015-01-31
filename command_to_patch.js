var _ = require('lodash');
var paths = require('./lib/paths');
var Project = require('./lib/project');

function patchResults(projectJSON, command) {
  var project = new Project(projectJSON);

  taskDelete(project, command);
  storyDelete(project, command);
  storyCreate(project, command);
  storyMove(project, command);
  storyAttr(project, command);
  taskCreate(project, command);
  taskMove(project, command);
  taskAttr(project, command);
  storyCommentCreate(project, command);
  storyCommentAttr(project, command);
  projectVersion(project, command);

  return project.log;
}

module.exports = patchResults;

function storyDelete(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'story' && (r.deleted || r.moved);
    })
    .each(function(r) {
      project.deleteStory(r.id);
    })
    .value();
}

function storyCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved) && !project.hasStory(r.id);
    })
    .each(function(r) {
      project.appendStory(r.id);
    })
    .value();
}

function storyMove(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved) && project.hasStory(r.id);
    })
    .sortBy(function(r) {
      return -1 * project.indexOfStory(r.id);
    })
    .map(function(r) {
      var index = project.indexOfStory(r.id);
      var afterId = project.storyAtIndex(index - 1);
      var beforeId = project.storyAtIndex(index + 1);

      return _.extend({
        after_id: afterId,
        before_id: beforeId
      }, r);
    })
    .each(function(r) {
      if (r.before_id) {
        project.moveStoryBefore(r.id, r.before_id);
      } else if (r.after_id) {
        project.moveStoryAfter(r.id, r.after_id);
      }
    })
    .value();
}

function storyAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved) && project.hasStory(r.id);
    })
    .each(function(r) {
      _.chain([
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
        'owned_by_id'
      ])
      .filter(function(attr) {
        return _.has(r, attr);
      })
      .each(function(attr) {
        project.setStoryAttr(r.id, attr, r[attr]);
      })
      .value();
    })
    .value();
;
}

function taskDelete(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && r.deleted;
    })
    .each(function(r) {
      project.deleteTask(r.id);
    })
    .value();
}

function taskCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && !project.hasStoryTask(r.id);
    })
    .each(function(r) {
      project.appendTask(r.story_id, r.id);
    })
    .value();
}

function taskMove(project, command) {
  _.chain(command.results)
    .value();
}

function taskAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && project.hasStoryTask(r.id);
    })
    .each(function(r) {
      _.chain([
        'description',
        'complete',
        'created_at',
        'updated_at'
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setTaskAttr(r.id, attr, r[attr]);
      })
      .value();
    })
    .value();
}

function storyCommentCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'comment' && r.story_id && !r.deleted && !project.hasStoryComment(r.id);
    })
    .each(function(r) {
      project.appendStoryComment(r.story_id, r.id);
    })
    .value();
};

function storyCommentAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'comment' && r.story_id && !r.deleted && project.hasStoryComment(r.id);
    })
    .each(function(r) {
       _.chain([
        'text',
        'person_id',
        'created_at',
        'updated_at'
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setStoryCommentAttr(r.id, attr, r[attr]);
      })
    })
    .value();
}

function projectVersion(project, command) {
  project.updateVersion(command.project.version);
}


// var ITERATION_ATTRS = [
//   'number',
//   'length',
//   'team_strength'
// ];

// function iterationDeletes(project, command) {
//   var patch = [];

//   command.results
//     .filter(typeIteration)
//     .filter(lengthDefault)
//     .forEach(function(result) {
//       var path = project.pathOfIterationOverrideByNumber(result.number);

//       patch.push({op: 'remove', path: path});
//     });

//   return patch;
// }


// function labelAttrs(project, command) {
//   var patch = [];

//   command.results
//     .filter(typeLabel)
//     .filter(notDeleted)
//     .forEach(function(result) {
//       var newIndex = _.sortedIndex(project.labelNames(), result.name);

//       patch.push(
//         {op: 'add', path: paths.label(newIndex), value: _.pick(result, 'id', 'name', 'created_at', 'updated_at')}
//       );
//     });

//   return patch;
// }


// var EPIC_ATTRS = [
//   'id',
//   'created_at',
//   'updated_at',
//   'name',
//   'description',
//   'label_id',
//   'follower_ids',
//   'past_done_stories_count',
//   'past_done_stories_no_point_count',
//   'past_done_story_estimates'
// ];


// function commentAttrs(project, command) {
//   var patch = [];

//   command.results
//     .filter(typeComment)
//     .filter(notDeleted)
//     .forEach(function(result) {

//       // new story comment
//       // new epic comment
//       // new comment existing story
//       // new comment existing epic
//       // update comment existing story
//       // update comment existing epic

//       var commentPath;

//       var storyIndex = project.indexOfStoryById(result.story_id);
//       if (storyIndex !== -1) {
//         commentPath = paths.storyComment(storyIndex, 0);
//       }

//       var epicIndex = project.indexOfEpicById(result.epic_id);
//       if (epicIndex !== -1) {
//         commentPath = paths.epicComment(epicIndex, 0);
//       }

//       var originalComment = project.get(commentPath);
//       if (!originalComment) {
//         var addOpValue = _.pick(result,
//           'id',
//           'text',
//           'person_id',
//           'created_at',
//           'updated_at'
//         );

//         if (result.google_attachment_ids && result.google_attachment_ids.length) {
//           addOpValue.google_attachments = [];

//           result.google_attachment_ids.forEach(function(gaId) {
//             var gaResult = _.where(command.results, {type: 'google_attachment', id: gaId})[0];

//             addOpValue.google_attachments.push(_.pick(gaResult,
//               'id',
//               'google_kind',
//               'person_id',
//               'resource_id',
//               'alternate_link',
//               'google_id',
//               'title'
//             ));
//           });
//         }

//         if (result.file_attachment_ids && result.file_attachment_ids.length) {
//           addOpValue.file_attachments = [];

//           result.file_attachment_ids.forEach(function(fileId) {
//             var fileResult = _.where(command.results, {type: 'file_attachment', id: fileId})[0];

//             addOpValue.file_attachments.push(_.pick(fileResult,
//               'id',
//               'filename',
//               'uploader_id',
//               'created_at',
//               'content_type',
//               'size',
//               'download_url',
//               'uploaded',
//               'thumbnailable',
//               'height',
//               'width',
//               'thumbnail_url',
//               'big_url'
//             ));
//           });
//         }

//         patch.push({
//           op: 'add',
//           path: commentPath,
//           value: _.defaults(addOpValue, {
//             google_attachments: [],
//             file_attachments: []
//           })
//         });
//       }
//     });

//   return patch;
// }
