var expect = require('chai').expect;
var helper = require('./helper');
var _ = require('lodash');
var jsonPatch = require('fast-json-patch');
var commandToPatch = require('../command_to_patch.js');

describe('story_update', function() {
  describe('estimating a story', function() {
    var before, after, command;

    beforeEach(function() {
      before = helper.loadFixture('277_project');
      after = helper.loadFixture('278_project');
      command = helper.loadFixture('278_command');
    });

    it('creates a patch to bring the story up to date', function() {
      var patch = commandToPatch(before, command);
      // var patched = _.clone(before);
      // jsonPatch.apply(patched, patch);

      var expectedPatch = jsonPatch.compare(before, after);
      // console.log(expectedPatch)

      expect(patch).to.deep.equal(expectedPatch);
    });
  });

  // it('works', function() {
  //   expect(helper.loadFixture('277_project')).to.deep.equal(helper.loadFixture('276_project'));
  // })
});

[ { op: 'replace',
    path: '/project/stories/36/updated_at',
    value: 1419348661000 },
  { op: 'add', path: '/project/stories/36/estimate', value: 8 } ]