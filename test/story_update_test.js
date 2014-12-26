var expect = require('chai').expect;
var helper = require('./helper');
var _ = require('lodash');
var jsonPatch = require('fast-json-patch');
var commandToPatch = require('../command_to_patch.js');

describe('story_update', function() {
  describe('278 estimating a story', function() {
    var before, after, command;

    beforeEach(function() {
      before = helper.loadFixture('277_project').project;
      after = helper.loadFixture('278_project').project;
      command = helper.loadFixture('278_command');
    });

    it('creates a patch', function() {
      var patch = commandToPatch(before, command);
      var patched = helper.patch(before, patch);
      expect(patched).to.deep.equal(after);
    });
  });

  describe('277 accepting a story', function() {
    var before, after, command;

    beforeEach(function() {
      before = helper.loadFixture('276_project').project;
      after = helper.loadFixture('277_project').project;
      command = helper.loadFixture('277_command');
    });

    it('creates a patch', function() {
      var patch = commandToPatch(before, command);
      var patched = helper.patch(before, patch);
      var actualIndex = helper.indexOfStory(patched, 2136);
      var expectedIndex = helper.indexOfStory(after, 2136);

      expect(actualIndex).to.equal(expectedIndex);
      expect(patched).to.deep.equal(after);
    });
  });

  describe('276 starting a story', function() {
    var before, after, command;

    beforeEach(function() {
      before = helper.loadFixture('275_project').project;
      after = helper.loadFixture('276_project').project;
      command = helper.loadFixture('276_command');
    });

    it('creates a patch', function() {
      var patch = commandToPatch(before, command);
      var patched = helper.patch(before, patch);
      var actualIndex = helper.indexOfStory(patched, 2136);
      var expectedIndex = helper.indexOfStory(after, 2136);

      expect(actualIndex).to.equal(expectedIndex);
      expect(patched).to.deep.equal(after);
    });
  });

  describe('275 moving a story between panels', function() {
    var before, after, command;

    beforeEach(function() {
      before = helper.loadFixture('274_project').project;
      after = helper.loadFixture('275_project').project;
      command = helper.loadFixture('275_command');
    });

    it('creates a patch', function() {
      var patch = commandToPatch(before, command);
      var patched = helper.patch(before, patch);
      var actualIndex = helper.indexOfStory(patched, 2136);
      var expectedIndex = helper.indexOfStory(after, 2136);

      expect(actualIndex).to.equal(expectedIndex);
      expect(patched).to.deep.equal(after);
    });
  });

  describe('274 moving a story', function() {
    var before, after, command;

    beforeEach(function() {
      before = helper.loadFixture('273_project').project;
      after = helper.loadFixture('274_project').project;
      command = helper.loadFixture('274_command');
    });

    it('creates a patch', function() {
      var patch = commandToPatch(before, command);
      var patched = helper.patch(before, patch);
      var actualIndex = helper.indexOfStory(patched, 2136);
      var expectedIndex = helper.indexOfStory(after, 2136);

      expect(actualIndex).to.equal(expectedIndex);
      expect(patched).to.deep.equal(after);
    });
  });
});
