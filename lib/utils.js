var R = require('ramda');

var utils = {
  compactObj: R.pickBy(
    R.compose(R.not, R.equals(null))
  ),

  getIndexLkp: function(memo, item, index) {
    memo[item.id] = index;
    return memo;
  },

  getContainsLkp: function(memo, id) {
    memo[id] = true;
    return memo;
  },
};

module.exports = utils;
