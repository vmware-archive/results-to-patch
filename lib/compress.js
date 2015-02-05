function compress(patches) {
  return (
    collapseAddAndMove(
      collapseAddAndReplace(
        filterNoopMove(patches))));
}

function filterNoopMove(patches) {
  return patches.filter(function(patch) {
    return !(patch.op === 'move' && patch.path === patch.from);
  });
}

function collapseAddAndReplace(patches) {
  var adds = {};

  return patches.filter(function(patch) {
    if (patch.op === 'add' && typeof patch.value === 'object' || typeof patch.value === 'array') {
      adds[patch.path] = patch;
    }
    else if (patch.op === 'replace') {
      var parent = parentOf(patch.path);

      if (adds[parent]) {
        adds[parent].value[keyOf(patch.path)] = patch.value;
        return false;
      }
    }

    return true;
  }, []);
}

function collapseAddAndMove(patches) {
  return patches.filter(function(patch, index, patches) {
    if (patch.op === 'move' && index > 0 && patches[index - 1].op === 'add' && patches[index - 1].path === patch.from) {
      patches[index - 1].path = patch.path;
      return false;
    }
    return true;
  });
}

function parentOf(path) {
  return path.slice(0, path.lastIndexOf('/'));
}

function keyOf(path) {
  return path.slice(path.lastIndexOf('/') + 1);
}

module.exports = compress;