var _               = require('lodash');
var chai            = require('chai');
var expect          = chai.expect;
var patchAssertion  = require('./patch_assertion');
var helper          = require('./helper');
var commandToPatch  = require('../lib/convert');
var translateParams = require('../lib/param-executor');
var compress        = require('../lib/compress');
chai.Assertion.addMethod('patch', patchAssertion.patch);
chai.Assertion.addMethod('patchLike', patchAssertion.patchLike);

// var FIXTURES = './test/fixtures/**/*.json';
// var FIXTURES = './test/fixtures/*Delete_*/*.json';
// var FIXTURES = './test/fixtures/*Update_*/*.json';
var FIXTURES = './test/fixtures/StoryUpdate_*/*.json';
// var FIXTURES = './test/fixtures/StoryUpdate_ff296a*/*.json';

helper.snapshots(FIXTURES).forEach(function(snapshot) {
  it('creates a patch for ' + snapshot.name, function() {
    var before  = snapshot['before.json'];
    var after   = snapshot['after.json'];
    var command = snapshot['command.json'].stale_commands[0];
    var patch   = translateParams(before, command).forward;

    expect(patch).to.patchLike(before, after);
  });
});

// helper.snapshots(FIXTURES).forEach(function(snapshot) {
//   it('creates a patch for ' + snapshot.name, function() {
//     var before  = snapshot['before.json'];
//     var after   = snapshot['after.json'];
//     var command = snapshot['command.json'].stale_commands[0];
//     var patch   = commandToPatch(before, command).forward;
//     patch = compress(patch);

//     expect(patch).to.patch(before, after);
//   });
// });

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
