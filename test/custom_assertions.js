var chai   = require('chai');
var helper = require('./helper');

var customAssertions = {
  patch: function (before, after) {
    var actual = this._obj;
    var patched = helper.patch(before, actual);
    new chai.Assertion(patched).to.deep.equal(after);
  }
};

module.exports = customAssertions;