var Project = require('./project');

var VERSION_EPSILON = 0.0001;

var paramExecutors = {
  comment_create: function(project, p) {},

  comment_delete: function(project, p) {
    project.deleteComment(p.id);
  },

  epic_create: function(project, p) {},

  epic_delete: function(project, p) {
    project.deleteEpic(p.id);
  },

  epic_move: function(project, p) {},

  epic_update: function(project, p) {
    [
      'name',
      'description',
      'follower_ids',
      'label_id',
      'past_done_stories_count',
      'past_done_stories_no_point_count',
      'past_done_story_estimates'
    ]
    .filter(function(attr) {
      return p.hasOwnProperty(attr);
    }).forEach(function(attr) {
      project.setEpicAttr(p.id, attr, p[attr]);
    });
  },

  follower_create: function(project, p) {},

  follower_delete: function(project, p) {
    if (p.story_id) {
      project.deleteStoryFollower(p.story_id, p.person_id);
    }
    else if (p.epic_id) {
      project.deleteEpicFollower(p.epic_id, p.person_id);
    }
  },

  iteration_update: function(project, p) {},

  label_update: function(project, p) {},

  multi_label_create: function(project, p) {},

  multi_story_delete: function(project, p) {
    p.ids.forEach(function(id) {
      project.deleteStory(id);
    });
  },

  multi_story_move_from_project: function(project, p) {},

  multi_story_move_into_project_and_prioritize: function(project, p) {},

  multi_story_move: function(project, p) {},

  multi_story_update_label: function(project, p) {},

  story_create: function(project, p) {},

  story_update: function(project, p) {
    [
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
      'owned_by_id',
      'label_ids'
    ]
    .filter(function(attr) {
      return p.hasOwnProperty(attr);
    })
    .forEach(function(attr) {
      project.setStoryAttr(p.id, attr, p[attr]);
    });

    // if (p.hasOwnProperty('label_ids')) {
    //   project.setStoryAttr(p.id, 'label_ids', p.label_ids.sort().reverse());
    // }

    if (p.hasOwnProperty('')) {

    }
  },

  task_create: function(project, p) {},

  task_delete: function(project, p) {
    project.deleteTask(p.id);
  },

  task_update: function(project, p) {
    if (p.hasOwnProperty('description')) {
      project.setStoryAttr(p.id, 'description', p.description);
    }
    if (p.hasOwnProperty('complete')) {
      project.setStoryAttr(p.id, 'complete', p.complete);
    }
  }
};

module.exports = function executeParams(projectJSON, command) {
  var project = new Project(projectJSON);

  paramExecutors[command.type](project, command.parameters);

  return {
    forward: project.forward,
    reverse: project.reverse
  };
};
