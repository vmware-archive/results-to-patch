var _                = require('lodash');
var chai             = require('chai');
var expect           = chai.expect;
var patchAssertion   = require('./patch_assertion');
var helper           = require('./helper');
var resultsToPatch   = require('../lib');
chai.Assertion.addMethod('patch', patchAssertion);

// var FIXTURES = './test/fixtures/MultiStoryDelete*/*.json';
var FIXTURES = './test/fixtures/**/*.json';

helper.snapshots(FIXTURES).forEach(function(snapshot) {
  it('creates a patch for ' + snapshot.name, function() {
    var before  = snapshot['before.json'];
    var after   = snapshot['after.json'];
    var command = snapshot['command.json'].stale_commands[0];

    var state = resultsToPatch(before, command);
    expect(state).to.deep.equal(after);

    // var patch   = resultsToPatch(before, command).forward;
    // expect(patch).to.patch(before, after);
  });
});
