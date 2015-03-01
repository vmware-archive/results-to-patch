var _              = require('lodash');
var chai           = require('chai');
var expect         = chai.expect;
var patchAssertion = require('./patch_assertion');
var helper         = require('./helper');
var commandToPatch = require('../lib/convert.js');
var compress       = require('../lib/compress.js');
var Immutable      = require('immutable');

chai.Assertion.addMethod('patch', patchAssertion);

var FIXTURES = './test/fixtures/**/*.json';
// var FIXTURES = './test/fixtures/CommentCreate_*/*.json';

helper.snapshots(FIXTURES).forEach(function(snapshot) {
  it('creates a patch for ' + snapshot.name, function() {
    var before  = Immutable.fromJS(snapshot['before.json']);
    var after   = Immutable.fromJS(snapshot['after.json']);
    var command = snapshot['command.json'].stale_commands[0];
    var patch   = commandToPatch(before, command).forward;
    patch = patch;

    expect(patch).to.patch(before, after);
  });
});

// snapshots.forEach(function(name) {
//   it('creates a reverse patch for ' + name, function() {
//     var snapshot = helper.loadSnapshot(name);
//     var before = snapshot.before;
//     var after = snapshot.after;
//     var command = snapshot.command.stale_commands[0];
//     var patch = commandToPatch(before, command);

//     expect(patch.reverse).to.patch(after, before);
//   });
// });
