// var _                = require('lodash');
// var chai             = require('chai');
// var expect           = chai.expect;
// var patchAssertion   = require('./patch_assertion');
// var helper           = require('./helper');
// var project          = require('../lib/project/index');

// // var FIXTURES         = './test/fixtures/StoryUpdate*/*.json';
// var FIXTURES         = './test/fixtures/MultiStoryDelete*/*.json';
// // var FIXTURES         = './test/fixtures/**/*.json';

// helper.snapshots(FIXTURES).forEach(function(snapshot) {
//   it('applies command ' + snapshot.name, function() {
//     var before  = snapshot['before.json'];
//     var after   = snapshot['after.json'];
//     var command = snapshot['command.json'].stale_commands[0];

//     const state = project(before, command);

//     // expect(state.stories.map(s => s.id)).to.deep.equal(after.stories.map(s => s.id));
//     // expect(state.stories.length).to.equal(after.stories.length);
//     expect(project(before, command)).to.deep.equal(after);
//   });
// });

// // snapshots.forEach(function(name) {
// //   it('creates a reverse patch for ' + name, function() {
// //     var snapshot = helper.loadSnapshot(name);
// //     var before = snapshot.before;
// //     var after = snapshot.after;
// //     var command = snapshot.command.stale_commands[0];
// //     var patch = commandToPatch(before, command);
// //     expect(patch.reverse).to.patch(after, before);
// //   });
// // });
