var chai             = require('chai');
var expect           = chai.expect;
var customAssertions = require('./custom_assertions');
var helper           = require('./helper');
var fs               = require('fs');
var commandToPatch   = require('../command_to_patch.js');

chai.Assertion.addMethod('patch', customAssertions.patch);

var snapshots = fs.readdirSync('./test/fixtures');

snapshots.forEach(function(name) {
  it('converts ' + name + ' to JSON patch', function() {
    var snapshot = helper.loadSnapshot(name);
    var before = snapshot.before;
    var after = snapshot.after;
    var command = snapshot.command.stale_commands[0];

    expect(
      commandToPatch(before, command)
    ).to.patch(before, after);
  });
});
