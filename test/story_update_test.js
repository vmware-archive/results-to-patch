var _                = require('lodash');
var chai             = require('chai');
var expect           = chai.expect;
var patchAssertion   = require('./patch_assertion');
var helper           = require('./helper');
var resultsToPatch   = require('../lib');
chai.Assertion.addMethod('patch', patchAssertion);

// var FIXTURES = './test/fixtures/MultiStoryMoveIntoProjectAndPrioritize_6482f5/*.json';
// var FIXTURES = './test/fixtures/CommentDelete*/*.json';
var FIXTURES = './test/fixtures/**/*.json';

helper.snapshots(FIXTURES).forEach(function(snapshot) {
  it('creates a patch for ' + snapshot.name, function() {
    var before  = snapshot['before.json'];
    var after   = snapshot['after.json'];
    var command = snapshot['command.json'].stale_commands[0];

    var state = resultsToPatch(before, command);

    expect(state).to.deep.equal(after);
    // expect(state.stories.map(formatPosition)).to.deep.equal(after.stories.map(formatPosition));
  });
});

function idToIndex(memo, story, index, array) {
  memo[story.id] = {
    index: index,
    before_id: (array[index + 1] || {}).id,
    after_id: (array[index - 1] || {}).id,
  };
  return memo;
}

function formatPosition(story, index) {
  return story.id;
}
