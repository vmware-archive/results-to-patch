var normalizr = require('normalizr');

var project           = new normalizr.Schema('projects');
var story             = new normalizr.Schema('stories');
var epic              = new normalizr.Schema('epics');
var label             = new normalizr.Schema('labels');
var integration       = new normalizr.Schema('integrations');
var iterationOverride = new normalizr.Schema('iterationOverrides', {idAttribute: 'number'});
var membership        = new normalizr.Schema('memberships');
var person            = new normalizr.Schema('people');
var task              = new normalizr.Schema('tasks');
var comment           = new normalizr.Schema('comments');
var fileAttachment    = new normalizr.Schema('fileAttachments');
var googleAttachment  = new normalizr.Schema('googleAttachments');

comment.define({
  file_attachments: normalizr.arrayOf(fileAttachment),
  google_attachments: normalizr.arrayOf(googleAttachment),
});

story.define({
  tasks: normalizr.arrayOf(task),
  comments: normalizr.arrayOf(comment),
});

epic.define({
  comments: normalizr.arrayOf(comment),
});

membership.define({
  person: person,
});

project.define({
  stories: normalizr.arrayOf(story),
  epics: normalizr.arrayOf(epic),
  labels: normalizr.arrayOf(label),
  integrations: normalizr.arrayOf(integration),
  iteration_overrides: normalizr.arrayOf(iterationOverride),
  memberships: normalizr.arrayOf(membership),
});

module.exports = function(json) {
  return normalizr.normalize(json, project);
};
