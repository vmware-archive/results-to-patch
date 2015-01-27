var chai             = require('chai');
var expect           = chai.expect;
var patchAssertion   = require('./patch_assertion');
var helper           = require('./helper');
var fs               = require('fs');
var commandToPatch   = require('../command_to_patch.js');

chai.Assertion.addMethod('patch', patchAssertion);

var snapshots = fs.readdirSync('./test/fixtures');
// var snapshots = ['EpicDelete_0ff7af'];

snapshots.forEach(function(name) {
  it('converts ' + name + ' to JSON patch', function() {
    var snapshot = helper.loadSnapshot(name);
    var before = snapshot.before;
    var after = snapshot.after;
    var command = snapshot.command.stale_commands[0];
    var patch = commandToPatch(before, command);

    // console.log(patch)

    expect(patch).to.patch(before, after);
  });
});
