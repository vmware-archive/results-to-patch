var fs = require('fs');
var _ = require('lodash');
var a = JSON.parse(fs.readFileSync('./json/before.json', 'utf8'));
var b = JSON.parse(fs.readFileSync('./json/after.json', 'utf8'));
// var b2 = JSON.parse(fs.readFileSync('./json/after2.json', 'utf8'));
// var b3 = JSON.parse(fs.readFileSync('./json/after3.json', 'utf8'));
var r = JSON.parse(fs.readFileSync('./json/response.json', 'utf8'));



var aMin = JSON.parse(fs.readFileSync('./json/before_min.json', 'utf8'));
var bMin = JSON.parse(fs.readFileSync('./json/after_min.json', 'utf8'));

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function xtest() {}

function test(a, b, options) {
  var diff = options.diff(a, b);
  var reverse = options.patch(clone(a), diff);
  console.log(options.name, diff.length, _.isEqual(reverse, b));
  // console.log(JSON.stringify(reverse, null, '  '))
}

// https://github.com/Starcounter-Jack/Fast-JSON-Patch
var fastJsonPatch = require('fast-json-patch');
xtest(a, b, {
  name: 'fast-json-patch',
  diff: function(a, b) { return fastJsonPatch.compare(a, b) },
  patch: function(a, d) { fastJsonPatch.apply(a, d); return a }
});

// https://github.com/chbrown/rfc6902
var rfc6902 = require('rfc6902');
xtest(aMin, bMin, {
  name: 'rfc6902',
  diff: function(a, b) { return rfc6902.diff(a, b) },
  patch: function(a, d) { return rfc6902.patch(a, d) }
});

var stories = aMin.stories;
function check(a, a1, a2, b, b1, b2) {
  var before = a.slice(a1, a2);
  var after = b.slice(b1, b2);
  var result = clone(before);
  fastJsonPatch.apply(result, rfc6902.diff(before, after));
  return _.isEqual(result, after);
}

for (var a1 = 0; a1 < aMin.stories.length; a1++) {
  for (var a2 = aMin.stories.length; a2 > a1; a2--) {
    for (var b1 = 0; b1 < bMin.stories.length; b1++) {
      for (var b2 = bMin.stories.length; b2 > b1; b2--) {
        check(aMin.stories, a1, a2, bMin.stories, b1, b2)
        // console.log(a1, a2, b1, b2, check(aMin.stories, a1, a2, bMin.stories, b1, b2))
      }
    }
  }
}



// xtest(a, b2, {
//   name: 'hand-crafted remove',
//   diff: function(a, b) {
//     return [{
//       op: 'remove',
//       path: '/data/project/stories/40'
//     }];
//   },
//   patch: function(a, d) { fastJsonPatch.apply(a, d); return a }
// });

// xtest(a, b, {
//   name: 'hand-crafted move 1',
//   diff: function(a, b) {
//     return [
//       {
//         op: 'replace',
//         path: '/project_version',
//         value: 251
//       },
//       {
//         op: 'replace',
//         path: '/data/project/version',
//         value: 251
//       },
//       {
//         op: 'replace',
//         path: '/data/project/stories/40/current_state',
//         value: 'started'
//       },
//       {
//         op: 'replace',
//         path: '/data/project/stories/40/updated_at',
//         value: 1418952115000
//       },
//       {
//         op: 'replace',
//         path: '/data/project/stories/40/owner_ids',
//         value: [202]
//       },
//       {
//         op: 'add',
//         path: '/data/project/stories/40/owned_by_id',
//         value: 202
//       },
//       {
//         op: 'move',
//         path: '/data/project/stories/21',
//         from: '/data/project/stories/40'
//       }
//     ];
//   },
//   patch: function(a, d) { fastJsonPatch.apply(a, d); return a }
// });

// var stories = b.data.project.stories;
// var s = _.findWhere(stories, {id: 2163});
// console.log(stories.indexOf(s))

// var stories = a.data.project.stories;
// var s = _.findWhere(stories, {id: 2163});
// console.log(stories.indexOf(s))