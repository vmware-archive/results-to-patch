var Project = require('./project');
var assign = require('object-assign');

function parse(state, command) {
  // Deletions
  state = iterationOverrideDelete(state, command);
  state = epicDelete(state, command);
  state = commentDelete(state, command);
  state = taskDelete(state, command);
  state = storyDelete(state, command);

  // Stories
  state = storyCreate(state, command);
  state = storyAttr(state, command);
  state = storyMove(state, command);


  // Epics
  state = epicCreate(state, command);
  state = epicMove(state, command);
  state = epicAttr(state, command);

  // Tasks
  state = taskCreate(state, command);
  state = taskMove(state, command);
  state = taskAttr(state, command);

  // Comments
  state = commentCreate(state, command);
  state = commentAttr(state, command);

  // File Attachments
  state = fileAttachmentAttr(state, command);

  // Google Attachments
  state = googleAttachmentAttr(state, command);

  // Labels
  state = labelCreate(state, command);
  state = labelAttr(state, command);
  state = labelMove(state, command);

  // Iteration Override
  state = iterationOverrideCreate(state, command);
  state = iterationOverrideAttr(state, command);

  // Project Version
  state = projectVersion(state, command);

  return state;
};

function update(first, second) {
  var obj = assign({}, first, second);
  for (var key in obj) {
    if (obj[key] === null) delete obj[key];
  }
  return obj;
}

function mask(original, allowedKeys) {
  var obj = assign({}, original);
  for (var key in obj) {
    if (!mask[key]) delete obj[key];
  }
  return obj;
}

function compact(obj) {
}

function storyDelete(state, command) {
  var results = command.results.filter(function(r) {
    return r.type === 'story' && (r.deleted || r.moved);
  });

  if (!results.length) return state;

  var idsToDelete = results.reduce(buildIdLookup, {});

  return assign({}, state, {
    stories: state.stories.filter(function(story) {
      return !idsToDelete[story.id];
    })
  });
}

function storyCreate(state, command) {
  var results = command.results.filter(function(r) {
    return r.type === 'story' && !(r.deleted || r.moved) && r.project_id;
  });

  if (!results.length) return state;

  var newStories = results.map(function(r) {
    return {
      id: r.id,
      tasks: [],
      comments: []
    }
  });

  return assign({}, state, {
    stories: state.stories.concat(newStories)
  });
}

function storyMove(state, command) {
  var project = new Project(state);

  command.results
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved);
    })
    .sort(sortBy(function(r) {
      return -1 * project.indexOfStory(r.id);
    }))
    .map(function(r) {
      var index = project.indexOfStory(r.id);
      return {
        id: r.id,
        after_id: r.hasOwnProperty('after_id') ? r.after_id : project.storyAtIndex(index - 1),
        before_id: r.hasOwnProperty('before_id') ? r.before_id : project.storyAtIndex(index + 1)
      };
    })
    .forEach(function(r) {
      if (r.before_id) {
        project.moveStoryBefore(r.id, r.before_id);
      } else if (r.after_id) {
        project.moveStoryAfter(r.id, r.after_id);
      }
    });

  return project.data;
}

function storyAttr(state, command) {
  var results = command.results.filter(function(r) {
    return r.type === 'story' && !(r.deleted || r.moved);
  }).map(function(r) {
    var attrs = {};
    attrs.id = r.id;
    if (r.hasOwnProperty('created_at')) attrs.created_at = r.created_at;
    if (r.hasOwnProperty('updated_at')) attrs.updated_at = r.updated_at;
    if (r.hasOwnProperty('accepted_at')) attrs.accepted_at = r.accepted_at;
    if (r.hasOwnProperty('integration_id')) attrs.integration_id = r.integration_id;
    if (r.hasOwnProperty('deadline')) attrs.deadline = r.deadline;
    if (r.hasOwnProperty('story_type')) attrs.story_type = r.story_type;
    if (r.hasOwnProperty('name')) attrs.name = r.name;
    if (r.hasOwnProperty('description')) attrs.description = r.description;
    if (r.hasOwnProperty('current_state')) attrs.current_state = r.current_state;
    if (r.hasOwnProperty('requested_by_id')) attrs.requested_by_id = r.requested_by_id;
    if (r.hasOwnProperty('owner_ids')) attrs.owner_ids = r.owner_ids;
    if (r.hasOwnProperty('label_ids')) attrs.label_ids = r.label_ids;
    if (r.hasOwnProperty('follower_ids')) attrs.follower_ids = r.follower_ids;
    if (r.hasOwnProperty('owned_by_id')) attrs.owned_by_id = r.owned_by_id;
    if (r.hasOwnProperty('estimate')) {
      attrs.estimate = r.estimate === -1 ? null : r.estimate;
    }
    if (r.hasOwnProperty('external_id')) {
      attrs.external_id = r.external_id === '' ? null : r.external_id;
    }
    return attrs;
  });

  if (!results.length) return state;

  var idsToUpdate = results.reduce(buildIdLookup, {});

  return assign({}, state, {
    stories: state.stories.map(function(story) {
      return idsToUpdate[story.id] ? update(story, idsToUpdate[story.id]) : story;
    })
  });
}

function taskDelete(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'task' && r.deleted;
    })
    .forEach(function(r) {
      project.deleteTask(r.id);
    });

  return project.data;
}

function taskCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'task' && r.story_id && !r.deleted;
    })
    .forEach(function(r) {
      project.appendTask(r.story_id, r.id);
    });
  return project.data;
}

function taskMove(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && r.position;
    })
    .forEach(function(r) {
      project.moveTask(r.id, r.position - 1);
    });
  return project.data;
}

function taskAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'task' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'description',
        'complete',
        'created_at',
        'updated_at'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setStoryTaskAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
}

function commentDelete(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'comment' && r.deleted;
    })
    .forEach(function(r) {
      project.deleteComment(r.id);
    });
  return project.data;
};

function commentCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'comment' && (r.story_id || r.epic_id) && !r.deleted;
    })
    .forEach(function(r) {
      if (r.story_id) {
        project.appendComment(project.pathOfStory(r.story_id), r.id);
      } else if (r.epic_id) {
        project.appendComment(project.pathOfEpic(r.epic_id), r.id);
      }
    });
  return project.data;
};

function commentAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'comment' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'text',
        'person_id',
        'created_at',
        'updated_at'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setCommentAttr(r.id, attr, r[attr]);
      });

      r.file_attachment_ids.forEach(function(faId, index) {
        if (!project.hasCommentFileAttachment(r.id, faId)) {
          project.appendCommentFileAttachment(r.id, faId, index);
        }
      });

      r.google_attachment_ids.forEach(function(gaId, index) {
        if (!project.hasGoogleAttachment(r.id, gaId)) {
          project.appendGoogleAttachment(r.id, gaId, index);
        }
      });
    });
  return project.data;
}

function fileAttachmentAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'file_attachment' && !r.deleted;
    })
    .forEach(function(r) {
      [
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
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setFileAttachmentAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
};


function googleAttachmentAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'google_attachment' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'google_kind',
        'person_id',
        'resource_id',
        'alternate_link',
        'google_id',
        'title'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setGoogleAttachmentAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
};

function labelCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'label' && !r.deleted && r.project_id;
    })
    .forEach(function(r) {
      project.appendLabel(r.id);
    });
  return project.data;
};

function labelMove(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'label' && !r.deleted && r.name;
    })
    .sort(sortBy(function(r) {
      return r.name;
    }))
    .forEach(function(r) {
      var newIndex = project.labelNames().sort().indexOf(r.name);
      project.moveLabel(r.id, newIndex);
    });
  return project.data;
}

function labelAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'label' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'name',
        'created_at',
        'updated_at'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setLabelAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
}

function epicDelete(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'epic' && r.deleted;
    })
    .forEach(function(r) {
      project.deleteEpic(r.id);
    })
  return project.data;
}

function epicCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted && r.project_id;
    })
    .forEach(function(r) {
      project.appendEpic(r.id);
    });
  return project.data;
}

function epicMove(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted && r.id && (r.before_id || r.after_id);
    })
    .sort(sortBy(function(r) {
      return -1 * project.indexOfEpic(r.id);
    }))
    .forEach(function(r) {
      if (r.before_id) {
        project.moveEpicBefore(r.id, r.before_id);
      } else if (r.after_id) {
        project.moveEpicAfter(r.id, r.after_id);
      }
    });
  return project.data;
}

function epicAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted;
    })
    .forEach(function(r) {
      [
        'created_at',
        'updated_at',
        'name',
        'description',
        'follower_ids',
        'label_id',
        'past_done_stories_count',
        'past_done_stories_no_point_count',
        'past_done_story_estimates'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      }).forEach(function(attr) {
        project.setEpicAttr(r.id, attr, r[attr]);
      });
    });
  return project.data;
}

function iterationOverrideCreate(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length !== 'default' && !project.hasIterationOverride(r.number);
    })
    .forEach(function(r) {
      project.insertIterationOverride(r.number);
    });
  return project.data;
}

function iterationOverrideAttr(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length !== 'default';
    })
    .forEach(function(r) {
      [
        'length',
        'team_strength'
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setIterationOverrideAttr(r.number, attr, r[attr]);
      });
    })
  return project.data;
}

function iterationOverrideDelete(state, command) {
  var project = new Project(state);
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length === 'default';
    })
    .forEach(function(r) {
      project.deleteIterationOverride(r.number);
    });
  return project.data;
}

function projectVersion(state, command) {
  var project = new Project(state);
  project.updateVersion(command.project.version);
  return project.data;
}

function sortBy(sorter) {
  return function(a, b) {
    var aVal = sorter(a);
    var bVal = sorter(b);

    if (aVal > bVal) {
      return 1;
    } else if (aVal < bVal) {
      return -1;
    } else {
      return 0;
    }
  }
}

function buildIdLookup(memo, item) {
  memo[item.id] = item;
  return memo;
}

module.exports = parse;
