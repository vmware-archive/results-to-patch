var Project = require('./project');
var assign = require('object-assign');
var reducer = require('./reducer');
var Q = require('./q');

function parse(state, command) {
  state = iterationOverrideDelete(state, command);

  state = [].concat(
    projectVersion(command),
    commentDelete(state, command),
    taskDelete(command),
    epicDelete(command),
    storyCreate(command),
    storyDelete(command),
    storyAttr(command),
    taskCreate(command),
    taskMove(command),
    taskAttr(command)
  ).reduce(reducer, state);

  state = [].concat(
    storyMove(state, command)
  ).reduce(reducer, state);

  state = epicCreate(state, command);
  state = epicMove(state, command);
  state = epicAttr(state, command);
  state = commentCreate(state, command);
  state = commentAttr(state, command);
  state = fileAttachmentAttr(state, command);
  state = googleAttachmentAttr(state, command);
  state = labelCreate(state, command);
  state = labelAttr(state, command);
  state = labelMove(state, command);
  state = iterationOverrideCreate(state, command);
  state = iterationOverrideAttr(state, command);

  return state;
};

function storyDelete(command) {
  return command.results.filter(function(r) {
    return r.type === 'story' && (r.deleted || r.moved);
  })
  .map(function(r) {
    return {type: reducer.DELETE_STORY, id: r.id};
  });
}

function storyCreate(command) {
  return command.results.filter(function(r) {
    return r.type === 'story' && !(r.deleted || r.moved) && r.project_id;
  })
  .map(function(r) {
    return {type: reducer.CREATE_STORY, id: r.id};
  })
} 

// function storyMoveChunk(state, command) {
//   var q = Q(state);

//   var meta = command.results
//     .filter(function(r) {
//       return r.type === 'story' && !(r.deleted || r.moved);
//     })
//     .map(function(r) {
//       return {
//         id: r.id,
//         index: q.indexOfStory(r.id),
//         after_id: r.after_id,
//         before_id: r.before_id
//       };
//     })
//     .sort(sortBy(function(r) {
//       return -1 * r.index;
//     }))

//   return {
//     type: reducer.MOVE_STORY_CHUNK,
//     ids: meta.map(function(m) { return m.id; })
//   }
// }

function storyMove(state, command) {
  var q = Q(state);

  return command.results
    .filter(function(r) {
      return r.type === 'story' && !(r.deleted || r.moved);
    })
    .map(function(r) {
      var index = q.indexOfStory(r.id);

      return {
        type: reducer.MOVE_STORY,
        id: r.id,
        index: index,
        after_id: r.hasOwnProperty('after_id') ? r.after_id : q.storyAtIndex(index - 1),
        before_id: r.hasOwnProperty('before_id') ? r.before_id : q.storyAtIndex(index + 1),
      };
    })
    .sort(sortBy(function(r) {
      return -1 * r.index;
    }))
}

function storyAttr(command) {
  return command.results.filter(function(r) {
    return r.type === 'story' && !(r.deleted || r.moved);
  })
  .map(function(r) {
    return assign({}, r, {type: reducer.UPDATE_STORY});
  })
}

function taskDelete(command) {
  return command.results
    .filter(function(r) {
      return r.type === 'task' && r.deleted;
    })
    .map(function(r) {
      return {type: reducer.DELETE_TASK, id: r.id};
    })
}

function taskCreate(command) {
  return command.results
    .filter(function(r) {
      return r.type === 'task' && r.story_id && !r.deleted;
    })
    .map(function(r) {
      return {type: reducer.CREATE_TASK, id: r.id, storyId: r.story_id};
    })
}

function taskMove(command) {
  return command.results
    .filter(function(r) {
      return r.type === 'task' && !r.deleted && r.position;
    })
    .map(function(r) {
      return {type: reducer.MOVE_TASK, id: r.id, position: r.position};
    })
}

function taskAttr(command) {
  return command.results
    .filter(function(r) {
      return r.type === 'task' && !r.deleted;
    })
    .map(function(r) {
      return assign({}, r, {type: reducer.UPDATE_TASK});
    })
}

function commentDelete(state, command) {
  var q = Q(state);

  return command.results
    .filter(function(r) {
      return r.type === 'comment' && r.deleted;
    })
    .map(function(r) {
      if (q.pathOfStoryComment(r.id)) {
        return {type: reducer.DELETE_STORY_COMMENT, id: r.id};
      }
      return {type: reducer.DELETE_EPIC_COMMENT, id: r.id};
    })
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

function epicDelete(command) {
  return command.results
    .filter(function(r) {
      return r.type === 'epic' && r.deleted;
    })
    .map(function(r) {
      return {type: reducer.DELETE_EPIC, id: r.id};
    })
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

function projectVersion(command) {
  return {type: reducer.UPDATE_VERSION, version: command.project.version};
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

module.exports = parse;
