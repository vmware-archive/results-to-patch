var _      = require('lodash');
var chai   = require('chai');
var helper = require('./helper');

function omit(json) {
  if (_.isArray(json)) {
    return json.map(omit);
  }

  if (_.isObject(json)) {
    json = _.omit(json, 'version', 'updated_at', 'accepted_at');

    for (var prop in json) {
      json[prop] = omit(json[prop]);
    }
    return json;
  }

  return json;
}

function patch(before, after) {
  var actual = this._obj;
  var patched = helper.patch(before, actual);
  new chai.Assertion(patched).to.deep.equal(after);
}

function patchLike(before, after) {
  var actual = this._obj;
  var patched = helper.patch(before, actual);

  after = omit(after);
  patched = omit(patched);

  new chai.Assertion(patched).to.deep.equal(after);
}

module.exports = {
  patch: patch,
  patchLike: patchLike,
};