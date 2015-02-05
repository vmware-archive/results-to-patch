var Project = require('./project');

module.exports = function patchResults(projectJSON, command) {
  var project = new Project(projectJSON);

  // Deletions
  iterationOverrideDelete(project, command);
  epicDelete(project, command);
  commentDelete(project, command);
  taskDelete(project, command);
  storyDelete(project, command);

  // Stories
  storyCreate(project, command);
  storyMove(project, command);
  storyAttr(project, command);

  // Epics
  epicCreate(project, command);
  epicMove(project, command);
  epicAttr(project, command);

  // Tasks
  taskCreate(project, command);
  taskMove(project, command);
  taskAttr(project, command);

  // Comments
  commentCreate(project, command);
  commentAttr(project, command);

  // File Attachments
  fileAttachmentAttr(project, command);

  // Google Attachments
  googleAttachmentAttr(project, command);

  // Labels
  labelCreate(project, command);
  labelAttr(project, command);
  labelMove(project, command);

  // Iteration Override
  iterationOverrideCreate(project, command);
  iterationOverrideAttr(project, command);

  // Project Version
  projectVersion(project, command);

  return {
    forward: project.forward,
    reverse: project.reverse
  };
};

function storyDelete(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'story' && (r.deleted || r.moved);
    })
    .forEach(function(r) {
      project.deleteStory(r.id);
    });
}

function storyCreate(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved) && r.project_id;
    })
    .forEach(function(r) {
      project.appendStory(r.id);
    });
}

function storyMove(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved);
    })
    .sort(sortBy(function(r) {
      return -1 * project.indexOfStory(r.id);
    }))
    .map(function(r) {
      var index = project.indexOfStory(r.id);

      if (!r.hasOwnProperty('after_id')) {
        r.after_id = project.storyAtIndex(index - 1);
      }

      if (!r.hasOwnProperty('before_id')) {
        r.before_id = project.storyAtIndex(index + 1);;
      }

      return r;
    })
    .forEach(function(r) {
      if (r.before_id) {
        project.moveStoryBefore(r.id, r.before_id);
      } else if (r.after_id) {
        project.moveStoryAfter(r.id, r.after_id);
      }
    });
}

function storyAttr(project, command) {
  command.results
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
    .forEach(function(r) {
      [
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
      ]
      .filter(function(attr) {
        return r.hasOwnProperty(attr);
      })
      .forEach(function(attr) {
        project.setStoryAttr(r.id, attr, r[attr]);
      });
    });
}

function taskDelete(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'task' && r.deleted;
    })
    .forEach(function(r) {
      project.deleteTask(r.id);
    });
}

function taskCreate(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'task' && r.story_id && !r.deleted;
    })
    .forEach(function(r) {
      project.appendTask(r.story_id, r.id);
    });
}

function taskMove(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && r.position;
    })
    .forEach(function(r) {
      project.moveTask(r.id, r.position - 1);
    });
}

function taskAttr(project, command) {
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
}

function commentDelete(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'comment' && r.deleted;
    })
    .forEach(function(r) {
      project.deleteComment(r.id);
    });
};

function commentCreate(project, command) {
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
};

function commentAttr(project, command) {
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
}

function fileAttachmentAttr(project, command) {
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
};


function googleAttachmentAttr(project, command) {
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
};

function labelCreate(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'label' && !r.deleted && r.project_id;
    })
    .forEach(function(r) {
      project.appendLabel(r.id);
    });
};

function labelMove(project, command) {
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
}

function labelAttr(project, command) {
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
}

function epicDelete(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'epic' && r.deleted;
    })
    .forEach(function(r) {
      project.deleteEpic(r.id);
    })
}

function epicCreate(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'epic' && !r.deleted && r.project_id;
    })
    .forEach(function(r) {
      project.appendEpic(r.id);
    });
}

function epicMove(project, command) {
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
}

function epicAttr(project, command) {
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
}

function iterationOverrideCreate(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length !== 'default' && !project.hasIterationOverride(r.number);
    })
    .forEach(function(r) {
      project.insertIterationOverride(r.number);
    });
}

function iterationOverrideAttr(project, command) {
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
}

function iterationOverrideDelete(project, command) {
  command.results
    .filter(function(r) {
      return r.type === 'iteration' && r.length === 'default';
    })
    .forEach(function(r) {
      project.deleteIterationOverride(r.number);
    });
}

function projectVersion(project, command) {
  project.updateVersion(command.project.version);
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
