var pointer = require('json-pointer');
var _ = require('lodash');

function commandToPatch(project, command) {
  var patch = [];

  var id = pointer.get(command, '/results/0/id');
  var stories = pointer.get(project, '/project/stories');
  var story = _.findWhere(stories, {id: id});
  var index = stories.indexOf(story);
  var storyPath = '/project/stories/' + index;

  var updatedAt = pointer.get(command, '/results/0/updated_at');
  patch.push({op: 'replace', path: storyPath + '/updated_at', value: updatedAt});

  var estimate = pointer.get(command, '/results/0/estimate');
  patch.push({op: 'add', path: storyPath + '/estimate', value: estimate});

  var version = pointer.get(command, '/project/version');
  patch.push({op: 'replace', path: '/project/version', value: version});

  return patch;
}

var StorySchema = ResultSchema.extend({
  type: 'story',


});

var StoryResultParser = ResultParser.extend({
  type: 'story',

  schema: {
    updated_at: SchemaTypes.Number,
    current_state: SchemaTypes.oneOf(['started', 'unscheduled']),
  }

  pointer: '/project/stories',


});

ResultAttribute.extend({
  type: 'story',

});

module.exports = commandToPatch;