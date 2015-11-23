// var _                = require('lodash');
// var chai             = require('chai');
// var expect           = chai.expect;
// var patchAssertion   = require('./patch_assertion');
// var helper           = require('./helper');
// var resultsToPatch   = require('../lib');
// var schema           = require('../lib/normalizer');
// chai.Assertion.addMethod('patch', patchAssertion);

// // var FIXTURES = './test/fixtures/**/*.json';
// // var FIXTURES = './test/fixtures/*StoryUpdate*/*.json';
// // var FIXTURES = './test/fixtures/StoryUpdate_710d16/*.json';
// // var FIXTURES = './test/fixtures/CommentCreate_03e0cb/*.json';
// var FIXTURES = './test/fixtures/TaskUpdate_b4f70c/*.json';

// helper.snapshots(FIXTURES).forEach(function(snapshot) {
//   it('creates a patch for ' + snapshot.name, function() {
//     var before  = snapshot['before.json'];
//     var after   = snapshot['after.json'];
//     var command = snapshot['command.json'].stale_commands[0];

//     // console.log(schema(before))
//     var normalized = schema(before);
//     // console.log(normalized.entities);
//     console.log(Object.keys(normalized.entities));
//     console.log(normalized.entities.googleAttachments);
//     // console.log(JSON.stringify(normalized, null, '  '));
//     // expect(normalized).to.deep.equal(after);

//     var state = resultsToPatch(before, command);

//     expect(state).to.deep.equal(after);
//     // expect(state.stories.map(formatPosition)).to.deep.equal(after.stories.map(formatPosition));
//   });
// });

// function idToIndex(memo, story, index, array) {
//   memo[story.id] = {
//     index: index,
//     before_id: (array[index + 1] || {}).id,
//     after_id: (array[index - 1] || {}).id,
//   };
//   return memo;
// }

// function formatPosition(story, index) {
//   return story.id;
// }
