var _ = require('lodash');
var paths = require('./lib/paths');
var Project = require('./lib/project');

module.exports = function patchResults(projectJSON, command) {
  var project = new Project(projectJSON);

  // Deletions
  iterationOverrideDelete(project, command);
  epicDelete(project, command);
  commentDelete(project, command);
  storyTaskDelete(project, command);
  storyDelete(project, command);

  // Stories
  storyCreate(project, command);
  storyMove(project, command);
  storyAttr(project, command);

  // Story Tasks
  storyTaskCreate(project, command);
  storyTaskMove(project, command);
  storyTaskAttr(project, command);

  // Story Comments
  storyCommentCreate(project, command);
  storyCommentAttr(project, command);

  // Epic Comments
  epicCommentCreate(project, command);
  epicCommentAttr(project, command);

  // File Attachments
  fileAttachmentAttr(project, command);

  // Google Attachments
  googleAttachmentAttr(project, command);

  // Labels
  labelCreate(project, command);
  labelAttr(project, command);
  labelMove(project, command);

  // Epics
  epicCreate(project, command);
  epicMove(project, command);
  epicAttr(project, command);

  // Iteration Override
  iterationOverrideCreate(project, command);
  iterationOverrideAttr(project, command);

  // Project Version
  projectVersion(project, command);

  return project.log;
};

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
      return r.type === 'story' && !(r.deleted || r.moved);
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
      return r.type === 'story' && !(r.deleted || r.moved);
    })
    .map(function(r) {
      if (r.estimate === -1) {
        r.estimate = null;
      }
      if (r.external_id === '') {
        r.external_id = null;
      }
      return r;
    })
    .each(function(r) {
      _.chain([
        'created_at',
        'updated_at',
        'accepted_at',
        'estimate',
        'external_id',
        'integration_id',
        'deadline',
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

function storyTaskDelete(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && r.deleted;
    })
    .each(function(r) {
      project.deleteTask(r.id);
    })
    .value();
}

function storyTaskCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && !project.hasStoryTask(r.id);
    })
    .each(function(r) {
      project.appendTask(r.story_id, r.id);
    })
    .value();
}

function storyTaskMove(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && r.position;
    })
    .each(function(r) {
      project.moveTask(r.id, r.position - 1);
    })
    .value();
}

function storyTaskAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'task' && !r.deleted;
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
        project.setStoryTaskAttr(r.id, attr, r[attr]);
      })
      .value();
    })
    .value();
}

function commentDelete(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'comment' && r.deleted;
    })
    .each(function(r) {
      project.deleteComment(r.id);
    })
    .value();
};

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
      return r.type === 'comment' && !r.deleted && project.hasStoryComment(r.id);
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
      .value();

      _.each(r.file_attachment_ids, function(faId, index) {
        if (!project.hasStoryCommentFileAttachment(r.id, faId)) {
          project.appendStoryCommentFileAttachment(r.id, faId, index);
        }
      });

      _.each(r.google_attachment_ids, function(gaId, index) {
        if (!project.hasGoogleAttachment(r.id, gaId)) {
          project.appendGoogleAttachment(r.id, gaId, index);
        }
      });
    })
    .value();
}

function epicCommentCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'comment' && r.epic_id && !r.deleted && !project.hasEpicComment(r.id);
    })
    .each(function(r) {
      project.appendEpicComment(r.epic_id, r.id);
    })
    .value();
};

function epicCommentAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'comment' && !r.deleted && project.hasEpicComment(r.id);
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
        project.setEpicCommentAttr(r.id, attr, r[attr]);
      });
    })
    .value();
}

function fileAttachmentAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'file_attachment' && !r.deleted;
    })
    .each(function(r) {
       _.chain([
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
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setFileAttachmentAttr(r.id, attr, r[attr]);
      })
    })
    .value();
};


function googleAttachmentAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'google_attachment' && !r.deleted;
    })
    .each(function(r) {
       _.chain([
        'google_kind',
        'person_id',
        'resource_id',
        'alternate_link',
        'google_id',
        'title'
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setGoogleAttachmentAttr(r.id, attr, r[attr]);
      })
    })
    .value();
};

function labelCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'label' && !r.deleted && r.id && !project.hasLabel(r.id);
    })
    .each(function(r) {
      project.appendLabel(r.id);
    })
    .value();
};

function labelMove(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'label' && !r.deleted && r.name;
    })
    .sortBy(function(r) {
      return r.name;
    })
    .each(function(r) {
      var newIndex = project.labelNames().sort().indexOf(r.name);
      project.moveLabel(r.id, newIndex);
    })
    .value();
}

function labelAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'label' && !r.deleted;
    })
    .each(function(r) {
       _.chain([
        'name',
        'created_at',
        'updated_at'
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setLabelAttr(r.id, attr, r[attr]);
      })
    })
    .value();
}

function epicDelete(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'epic' && r.deleted;
    })
    .each(function(r) {
      project.deleteEpic(r.id);
    })
    .value();
}

function epicCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted && !project.hasEpic(r.id);
    })
    .each(function(r) {
      project.appendEpic(r.id);
    })
    .value();
}

function epicMove(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted && r.id && (r.before_id || r.after_id);
    })
    .sortBy(function(r) {
      return -1 * project.indexOfEpic(r.id);
    })
    .each(function(r) {
      if (r.before_id) {
        project.moveEpicBefore(r.id, r.before_id);
      } else if (r.after_id) {
        project.moveEpicAfter(r.id, r.after_id);
      }
    })
    .value();
}

function epicAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted;
    })
    .each(function(r) {
       _.chain([
        'created_at',
        'updated_at',
        'name',
        'description',
        'follower_ids',
        'label_id',
        'past_done_stories_count',
        'past_done_stories_no_point_count',
        'past_done_story_estimates'
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setEpicAttr(r.id, attr, r[attr]);
      })
    })
    .value();
}

function iterationOverrideCreate(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'iteration' && r.number && r.length !== 'default' && !project.hasIterationOverride(r.number);
    })
    .each(function(r) {
      project.insertIterationOverride(r.number);
    })
    .value();
}

function iterationOverrideAttr(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'iteration' && r.number && r.length !== 'default';
    })
    .each(function(r) {
       _.chain([
        'length',
        'team_strength'
      ]).filter(function(attr) {
        return _.has(r, attr);
      }).each(function(attr) {
        project.setIterationOverrideAttr(r.number, attr, r[attr]);
      })
    })
    .value();
}

function iterationOverrideDelete(project, command) {
  _.chain(command.results)
    .filter(function(r) {
      return r.type === 'iteration' && r.number && r.length === 'default';
    })
    .each(function(r) {
      project.deleteIterationOverride(r.number);
    })
    .value();
}

function projectVersion(project, command) {
  project.updateVersion(command.project.version);
}
