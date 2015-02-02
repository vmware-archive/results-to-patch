var _                = require('lodash');
var chai             = require('chai');
var expect           = chai.expect;
var patchAssertion   = require('./patch_assertion');
var helper           = require('./helper');
var fs               = require('fs');
var commandToPatch   = require('../command_to_patch.js');

chai.Assertion.addMethod('patch', patchAssertion);

var snapshots = fs.readdirSync('./test/fixtures').filter(function(f) { return f !== '.DS_Store' });
// var snapshots = ['StoryUpdate_fe0ca7'];

snapshots.forEach(function(name) {
  it('creates a patch for ' + name, function() {
    var snapshot = helper.loadSnapshot(name);
    var before = snapshot.before;
    var after = snapshot.after;
    var command = snapshot.command.stale_commands[0];
    var patch = commandToPatch(before, command).forward;

    expect(patch).to.patch(before, after);
  });
});

snapshots.forEach(function(name) {
  it('creates a reverse patch for ' + name, function() {
    var snapshot = helper.loadSnapshot(name);
    var before = snapshot.before;
    var after = snapshot.after;
    var command = snapshot.command.stale_commands[0];
    var patch = commandToPatch(before, command).reverse;

    expect(patch).to.patch(after, before);
  });
});
