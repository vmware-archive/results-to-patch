var chai             = require('chai');
var expect           = chai.expect;
var commandToPatch   = require('../command_to_patch.js');
var customAssertions = require('./custom_assertions');
var helper           = require('./helper');
var project          = helper.project;
var command          = helper.command;

chai.Assertion.addMethod('patch', customAssertions.patch);

describe('commandToPatch', function() {
  it('estimates a story', function() {
    expect(commandToPatch(project(277), command(278))).to.patch(project(277), project(278));
  });

  it('accepts a story', function() {
    expect(commandToPatch(project(276), command(277))).to.patch(project(276), project(277));
  });

  it('starts a story', function() {
    expect(commandToPatch(project(276), command(277))).to.patch(project(276), project(277));
  });

  it('moves a story between panels', function() {
    expect(commandToPatch(project(275), command(276))).to.patch(project(275), project(276));
  });

  it('moves a story', function() {
    expect(commandToPatch(project(274), command(275))).to.patch(project(274), project(275));
  });
});
