var chai   = require('chai');
var helper = require('./helper');

function patch(before, after) {
  var actual = this._obj;
  var patched = helper.patch(before, actual);
  // console.log('patched', JSON.stringify(patched, null, '\t'))
  new chai.Assertion(patched).to.deep.equal(after);
}

module.exports = patch;