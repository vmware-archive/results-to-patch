
//   state = fileAttachmentAttr(state, command);
//   state = googleAttachmentAttr(state, command);
//   state = epicMove(state, command);
//   state = labelMove(state, command);

//   return state;
// };

// function fileAttachmentAttr(state, command) {
//   var project = new Project(state);
//   command.results
//     .filter(function(r) {
//       return r.type === 'file_attachment' && !r.deleted;
//     })
//     .forEach(function(r) {
//       [
//         'filename',
//         'uploader_id',
//         'created_at',
//         'content_type',
//         'size',
//         'download_url',
//         'uploaded',
//         'thumbnailable',
//         'height',
//         'width',
//         'thumbnail_url',
//         'big_url'
//       ]
//       .filter(function(attr) {
//         return r.hasOwnProperty(attr);
//       })
//       .forEach(function(attr) {
//         project.setFileAttachmentAttr(r.id, attr, r[attr]);
//       });
//     });
//   return project.data;
// };

// function googleAttachmentAttr(state, command) {
//   var project = new Project(state);
//   command.results
//     .filter(function(r) {
//       return r.type === 'google_attachment' && !r.deleted;
//     })
//     .forEach(function(r) {
//       [
//         'google_kind',
//         'person_id',
//         'resource_id',
//         'alternate_link',
//         'google_id',
//         'title'
//       ]
//       .filter(function(attr) {
//         return r.hasOwnProperty(attr);
//       })
//       .forEach(function(attr) {
//         project.setGoogleAttachmentAttr(r.id, attr, r[attr]);
//       });
//     });
//   return project.data;
// };

// function labelMove(state, command) {
//   var project = new Project(state);
//   command.results
//     .filter(function(r) {
//       return r.type === 'label' && !r.deleted && r.name;
//     })
//     .sort(sortBy(function(r) {
//       return r.name;
//     }))
//     .forEach(function(r) {
//       var newIndex = project.labelNames().sort().indexOf(r.name);
//       project.moveLabel(r.id, newIndex);
//     });
//   return project.data;
// }

// function epicMove(state, command) {
//   var project = new Project(state);
//   command.results
//     .filter(function(r) {
//       return r.type === 'epic' && !r.deleted && r.id && (r.before_id || r.after_id);
//     })
//     .sort(sortBy(function(r) {
//       return -1 * project.indexOfEpic(r.id);
//     }))
//     .forEach(function(r) {
//       if (r.before_id) {
//         project.moveEpicBefore(r.id, r.before_id);
//       } else if (r.after_id) {
//         project.moveEpicAfter(r.id, r.after_id);
//       }
//     });
//   return project.data;
// }

// function sortBy(sorter) {
//   return function(a, b) {
//     var aVal = sorter(a);
//     var bVal = sorter(b);

//     if (aVal > bVal) {
//       return 1;
//     } else if (aVal < bVal) {
//       return -1;
//     } else {
//       return 0;
//     }
//   }
// }

// module.exports = parse;
